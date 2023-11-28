# Raknet Server

## About

Raknet server allows the creation of a extremely fast and reliable UDP server using the Raknet protocol. With the combined speed of Rust and the portability of Typescript, this project is one of the best Raknet solutions for Typescript and Javascript.

## Usage

Raknet server has a super simple and straight forward api for quick and easy setup.

```ts
import { Server } from '@serenityjs/raknet-server';

// Create a new server
const server = new Server('0.0.0.0', 19132);

// Starts the server
const started = server.start(622, '1.20.41', 'Hello World!'); // Protocol, version, motd

// Check if the server started
if (started) {
	console.log('Server started');
} else {
	console.log('Failed to start server');
}

// Listen for packets
server.on('encapsulated', (client, buffer) => {
	console.log('Received encapsulated packet from', client.identifier.address, client.identifier.port);
});

// Listen for new connections
server.on('connect', (client) => {
	console.log('New connection:', client.identifier.address, client.identifier.port);
});

// Listen for disconnections
server.on('disconnect', (client) => {
	console.log('Disconnected:', client.identifier.address, client.identifier.port);
});
```
