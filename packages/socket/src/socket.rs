use napi_derive::napi;
use napi::{
  Result,
  Error,
  JsFunction,
  threadsafe_function::{
    ErrorStrategy,
    ThreadsafeFunction,
    ThreadsafeFunctionCallMode,
    ThreadSafeCallContext
  },
  Status::GenericFailure,
  bindgen_prelude::Buffer
};
use std::{
  thread,
  net::UdpSocket,
  sync::{
    Arc,
    Mutex
  }
};

#[napi(object)]
pub struct Packet {
  pub buffer: Buffer,
  pub address: String,
  pub port: u16,
  pub version: u8,
}

#[napi]
pub struct Socket {
  socket: Arc<Mutex<UdpSocket>>,
  running: Arc<Mutex<bool>>,
  queue: Arc<Mutex<Vec<Packet>>>,
  pub address: String,
  pub port: u16,
}

#[napi]
impl Socket {
  /**
   * Creates a new Socket instance
   * @param address The address to bind to
  */
  #[napi(constructor)]
  pub fn new(address: String, port: u16) -> Result<Self> {
    let socket = match UdpSocket::bind(format!("{}:{}", address, port)) {
      Ok(socket) => socket,
      Err(_) => return Err(
        Error::new(
          GenericFailure,
          "Failed to bind to the address"
        )
      )
    };

    Ok(Socket {
      socket: Arc::new(Mutex::new(socket)),
      running: Arc::new(Mutex::new(false)),
      queue: Arc::new(Mutex::new(vec![])),
      address,
      port,
    })
  }
}

#[napi]
impl Socket {
  /**
   * Listens and receives packets from the socket.
  */
  #[napi(ts_args_type = "incoming: (err: null | Error, result: Packet) => void, outgoing: (err: null | Error, result: Packet) => void")]
  pub fn listen(&mut self, incoming: Option<JsFunction>, outgoing: Option<JsFunction>) -> Result<()> {
    // Creates a new threadsafe function for incoming packets
    let tsfn_incoming: ThreadsafeFunction<_, ErrorStrategy::CalleeHandled> = match incoming {
      Some(incoming) => incoming.create_threadsafe_function(0, |ctx: ThreadSafeCallContext<Packet>| {
        ctx.env.create_object().map(|mut x| {
          x.set("buffer", ctx.value.buffer).unwrap();
          x.set("address", ctx.value.address).unwrap();
          x.set("port", ctx.value.port).unwrap();
          x.set("version", ctx.value.version).unwrap();
          vec![x]
        })
      }).unwrap(),
      None => return Err(
        Error::new(
          GenericFailure,
          "Callback is required for incoming packets"
        )
      )
    };

    // Creates a new threadsafe function for outgoing packets
    let tsfn_outgoing: ThreadsafeFunction<_, ErrorStrategy::CalleeHandled> = match outgoing {
      Some(outgoing) => outgoing.create_threadsafe_function(0, |ctx: ThreadSafeCallContext<Packet>| {
        ctx.env.create_object().map(|mut x| {
          x.set("buffer", ctx.value.buffer).unwrap();
          x.set("address", ctx.value.address).unwrap();
          x.set("port", ctx.value.port).unwrap();
          x.set("version", ctx.value.version).unwrap();
          vec![x]
        })
      }).unwrap(),
      None => return Err(
        Error::new(
          GenericFailure,
          "Callback is required for outgoing packets"
        )
      )
    };

    // Retrieve the running, socket, and queue variables from the struct
    let running = Arc::clone(&self.running);
    let socket = Arc::clone(&self.socket);
    let queue = Arc::clone(&self.queue);

    // Set the running flag to true
    *running.lock().unwrap() = true;

    // Spawn a new thread
    thread::spawn(move || {
      while *running.lock().unwrap() {
        // Gets the socket variable
        let socket = match socket.lock() {
          Ok(socket) => socket,
          Err(_) => continue
        };

        // Builds the max buffer size, and reads from the socket
        let mut buf = [0; u16::MAX as usize];
        let (size, src) = match socket.recv_from(&mut buf) {
          Ok((size, src)) => (size, src),
          Err(_) => continue
        };
        let bin = buf[0..size].to_vec();

        let version = if src.is_ipv4() { 4 } else { 6 }; // Gets the IP version

        // Creates a new RaknetPacket instance
        let packet = Packet {
          buffer: bin.into(),
          address: src.ip().to_string(),
          port: src.port(),
          version,
        };

        // Calls the incoming callback function
        tsfn_incoming.call(Ok(packet), ThreadsafeFunctionCallMode::Blocking);

        // Check if the queue is empty
        let mut queue = queue.lock().unwrap();
        if !queue.is_empty() {
          // Send the packet, and remove it from the queue
          let packet = queue.remove(0);

          match socket.send_to(&packet.buffer.as_ref(), format!("{}:{}", packet.address, packet.port)) {
            Ok(result) => result,
            Err(_) => continue
          };
          
          // Calls the outgoing callback function
          tsfn_outgoing.call(Ok(packet), ThreadsafeFunctionCallMode::Blocking);
        }
      }
    });

    Ok(())
  }

  /**
   * Closes the Socket instance.
  */
  #[napi]
  pub fn close(&mut self) -> () {
    // Check if the sender variable is set
    let mut running = self.running.lock().unwrap();
    *running = false;
  }

  #[napi]
  pub fn send(&mut self, buffer: Buffer, address: String, port: u16, version: u8) {
    // Push the packet to the queue
    let mut queue = self.queue.lock().unwrap();
    queue.push(Packet {
      buffer,
      address,
      port,
      version,
    });
  }
}
