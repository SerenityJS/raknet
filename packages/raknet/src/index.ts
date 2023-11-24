import { Socket } from '@serenityjs/raknet-socket';

const socket = new Socket('127.0.0.1', 19_132);

socket.listen(
	(error, { buffer, address, port }) => {
		console.log(buffer, address, port);
	},
	(error, { buffer }) => {},
);
