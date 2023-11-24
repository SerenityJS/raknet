import { Buffer } from 'node:buffer';
import type { Packet } from '@serenityjs/raknet-socket';
import { Socket } from '@serenityjs/raknet-socket';

class Raknet {
	protected readonly socket: Socket;
	public readonly address: string;
	public readonly port: number;
	public readonly guid: bigint;
	public motd: string | null = null;

	public constructor(address: string, port: number = 19_132) {
		this.socket = new Socket(address, port);
		this.address = this.socket.address;
		this.port = this.socket.port;
		this.guid = Buffer.allocUnsafe(8).readBigInt64BE();
	}

	public start(motd: string): boolean {
		this.motd = motd;

		// Attempt to start the server
		try {
			// Binds the incoming and outgoing functions to the socket
			this.socket.listen(this.incoming.bind(this), this.outgoing.bind(this));
			return true;
		} catch {
			return false;
		}
	}

	private incoming(error: Error | null, packet: Packet): void {
		// Checks if there was an error receiving the packet
		if (error) {
			return console.error('failed to receive packet', error);
		}

		// Destructures the packet
		const { buffer, address, port } = packet;

		console.log(buffer, address, port);
	}

	private outgoing(error: Error | null, packet: Packet): void {}
}

export { Raknet };
