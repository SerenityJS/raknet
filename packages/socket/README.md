# Raknet Socket

## About

Raknet socket is a bare-bones UDP socket that is written in (Rust)[https://www.rust-lang.org/] and uses (NAPI-RS)[https://napi.rs/] to export Node native modules for our Typescript and Javascript use!.

## Usage

Raknet socket has a super simple and straight forward api for quick and easy setup.

```ts
import { Socket } from '@serenityjs/raknet-socket';

// Creates a new udp socket
const socket = new Socket('0.0.0.0', 19132);

// Starts listening for packets
socket.listen(
	(error, packet) => {
		// Incoming packet
		const buffer = Buffer.from('hello world!');
		socket.send(buffer, packet.address, packet.port, packet.version);
	},
	(error, packet) => {
		// Outgoing packet
		console.log('sent packet with size', packet.buffer.length);
	},
);

// Closes the socket
socket.close();
```
