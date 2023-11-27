use napi_derive::napi;
use napi::{
  JsFunction,
  threadsafe_function::{
    ErrorStrategy,
    ThreadsafeFunction,
    ThreadsafeFunctionCallMode,
    ThreadSafeCallContext
  },
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
  pub fn new(address: String, port: u16) -> Self {
    let socket = UdpSocket::bind(format!("{}:{}", address, port)).unwrap();

    return Socket {
      socket: Arc::new(Mutex::new(socket)),
      running: Arc::new(Mutex::new(false)),
      queue: Arc::new(Mutex::new(vec![])),
      address,
      port,
    }
  }
}

#[napi]
impl Socket {
  /**
   * Listens and receives packets from the socket.
  */
  #[napi(ts_args_type = "incoming: (err: null | Error, result: Packet) => void, outgoing: (err: null | Error, result: Packet) => void")]
  pub fn listen(&mut self, incoming: Option<JsFunction>, outgoing: Option<JsFunction>) -> Self {
    // Creates a new threadsafe function for incoming packets
    let tsfn_incoming: ThreadsafeFunction<_, ErrorStrategy::CalleeHandled> = incoming.unwrap_or_else(|| {
      panic!("Callback is required for incoming packets")
    }).create_threadsafe_function(0, |ctx: ThreadSafeCallContext<Packet>| {
      ctx.env.create_object().map(|mut x| {
        x.set("buffer", ctx.value.buffer).unwrap();
        x.set("address", ctx.value.address).unwrap();
        x.set("port", ctx.value.port).unwrap();
        x.set("version", ctx.value.version).unwrap();
        vec![x]
      })
    }).unwrap();

    // Creates a new threadsafe function for outgoing packets
    let tsfn_outgoing: ThreadsafeFunction<_, ErrorStrategy::CalleeHandled> = outgoing.unwrap_or_else(|| {
      panic!("Callback is required for outgoing packets")
    }).create_threadsafe_function(0, |ctx: ThreadSafeCallContext<Packet>| {
      ctx.env.create_object().map(|mut x| {
        x.set("buffer", ctx.value.buffer).unwrap();
        x.set("address", ctx.value.address).unwrap();
        x.set("port", ctx.value.port).unwrap();
        x.set("version", ctx.value.version).unwrap();
        vec![x]
      })
    }).unwrap();

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
        let socket = socket.lock().unwrap();

        // Builds the max buffer size, and reads from the socket
        let mut buf = [0; u16::MAX as usize];
        let (size, src) = socket.recv_from(&mut buf).unwrap();
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
          socket.send_to(&packet.buffer.as_ref(), format!("{}:{}", packet.address, packet.port)).unwrap();
          
          // Calls the outgoing callback function
          tsfn_outgoing.call(Ok(packet), ThreadsafeFunctionCallMode::Blocking);
        }
      }
    });

    // Return the Socket instance
    return Self {
      socket: Arc::clone(&self.socket),
      running: Arc::clone(&self.running),
      queue: Arc::clone(&self.queue),
      address: self.address.clone(),
      port: self.port,
    }
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
  pub fn send(&mut self, buffer: Buffer, address: String, port: u16, version: u8) -> Self {
    // Push the packet to the queue
    let mut queue = self.queue.lock().unwrap();
    queue.push(Packet {
      buffer,
      address,
      port,
      version,
    });

    // Return the Socket instance
    return Self {
      socket: Arc::clone(&self.socket),
      running: Arc::clone(&self.running),
      queue: Arc::clone(&self.queue),
      address: self.address.clone(),
      port: self.port,
    }
  }
}
