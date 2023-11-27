import { Server } from './Server';

const raknet = new Server('0.0.0.0');

const started = raknet.start(
	'MCPE;Dedicated Server;390;1.14.60;0;10;13253860892328930865;Bedrock level;Survival;1;19132;19133;',
);

if (started) {
	console.log('Server started.');
} else {
	console.log('Failed to start server.');
}

raknet.on('connect', (connection) => {
	console.log('Client connected.', connection.guid);
});

raknet.on('disconnect', (connection) => {
	console.log('Client disconnected.', connection.guid);
});

raknet.on('encapsulated', (connection, buffer) => {
	console.log('Encapsulated packet received.', connection.guid, buffer);
});
