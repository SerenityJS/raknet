import { Buffer } from 'node:buffer';
import { setTimeout, clearTimeout } from 'node:timers';
import { Bitflags, RaknetTPS } from '@serenityjs/raknet-protocol';
import type { Packet } from '@serenityjs/raknet-socket';
import { Socket } from '@serenityjs/raknet-socket';
import { Offline } from './Offline';
import type { Connection } from './connection';
import type { NetworkIdentifier, ServerEvents } from './types';
import { EventEmitter } from './utils';

/**
 * **Raknet Server**
 *
 * Creates a Raknet protocol udp server.
 *
 * @class Server
 */
class Server extends EventEmitter<ServerEvents> {
	protected readonly socket: Socket;
	/**
	 * **address**
	 *
	 * The address of the server.
	 *
	 * @readonly
	 */
	public readonly address: string;
	/**
	 * **port**
	 *
	 * The port of the server.
	 *
	 * @readonly
	 */
	public readonly port: number;
	/**
	 * **guid**
	 *
	 * The guid of the server.
	 *
	 * @readonly
	 */
	public readonly guid: bigint;
	/**
	 * **connections**
	 *
	 * The connections of the server.
	 *
	 * @readonly
	 */
	public readonly connections: Map<string, Connection>;
	/**
	 * **motd**
	 *
	 * The motd of the server.
	 * This can be changed after the server has started.
	 */
	public motd: string | null = null;

	protected interval: NodeJS.Timeout | null = null;

	/**
	 * **Raknet Server**
	 *
	 * Creates a new Raknet server.
	 *
	 * @param {string} address - The address of the server.
	 * @param {number} port - The port of the server.
	 */
	public constructor(address: string, port: number = 19_132, maxConnections: number = 10) {
		super();
		this.socket = new Socket(address, port);
		this.address = this.socket.address;
		this.port = this.socket.port;
		this.guid = Buffer.allocUnsafe(8).readBigInt64BE();
		this.connections = new Map();

		Offline.server = this;
	}

	/**
	 * **start**
	 *
	 * Attempts to start the server. Returns true if the server started successfully.
	 *
	 * @param {string} motd - The motd of the server.
	 * @returns {boolean} Whether the server started successfully.
	 */
	public start(motd: string): boolean {
		// Sets the motd of the server
		// This allows the motd to be changed after the server has started
		this.motd = motd;

		// Attempt to start the server
		try {
			// Binds the incoming and outgoing functions to the socket
			this.socket.listen(this.incoming.bind(this), this.outgoing.bind(this));

			// Ticks the connections
			const tick = () =>
				setTimeout(() => {
					for (const [, connection] of this.connections) {
						connection.tick();
					}

					tick();
				}, RaknetTPS);

			// Sets the interval to the tick function
			this.interval = tick().unref();

			// Returns true if the server started successfully
			return true;
		} catch {
			// Returns false if the server failed to start
			return false;
		}
	}

	/**
	 * **stop**
	 *
	 * Stops the server.
	 */
	public async stop(): Promise<void> {
		// Closes the socket
		this.socket.close();

		// Clears the interval
		if (this.interval) clearTimeout(this.interval);
	}

	/**
	 * **send**
	 *
	 * Sends a buffer to a network identifier.
	 *
	 * @param {Buffer} buffer - The buffer to send.
	 * @param {NetworkIdentifier} identifier - The network identifier to send the buffer to.
	 */
	public send(buffer: Buffer, identifier: NetworkIdentifier): void {
		this.socket.send(buffer, identifier.address, identifier.port, identifier.version);
	}

	private incoming(error: Error | null, packet: Packet): void {
		// Checks if there was an error receiving the packet
		if (error) {
			return console.error('failed to receive packet', error);
		}

		// Deconstructs the packet into its buffer, address, port, and version
		const { buffer, address, port, version } = packet;
		// Creates the identifier key from the address and port
		const identifier: NetworkIdentifier = { address, port, version };
		const key = `${address}:${port}:${version}`;
		// Gets the connection from the connections map using the identifier key
		const connection = this.connections.get(key);

		// Checks if there is a connection, and if the packet send is valid
		if (connection && (buffer[0] & Bitflags.Valid) !== 0) return connection.incoming(buffer);
		// Checks if we got a valid packet from an offline session
		if ((buffer[0] & Bitflags.Valid) !== 0) return;

		// Lets the Offline class handle the packet
		return Offline.incoming(buffer, identifier);
	}

	private outgoing(error: Error | null, packet: Packet): void {
		if (error) {
			return console.error('failed to send packet', error);
		}
		// TODO: handle something here possibly???
	}
}

export { Server };
