import type { Buffer } from 'node:buffer';
import type { Socket as DgramSocket, RemoteInfo } from 'node:dgram';
import { createSocket } from 'node:dgram';

class Socket {
	public readonly address: string;
	public readonly port: number;
	protected readonly socket: DgramSocket;

	public constructor(address: string, port: number) {
		this.address = address;
		this.port = port;
		this.socket = createSocket('udp4');
	}

	public listen(incoming: (buffer: Buffer, rinfo: RemoteInfo) => void): boolean {
		// Attempt to bind the socket to the address and port.
		try {
			this.socket.bind(this.port, this.address);
			this.socket.on('message', incoming.bind(this));
			return true;
		} catch {
			return false;
		}
	}

	public send(buffer: Buffer, address: string, port: number): void {
		this.socket.send(buffer, port, address);
	}

	public close(): void {
		this.socket.close();
	}
}

export { Socket };
