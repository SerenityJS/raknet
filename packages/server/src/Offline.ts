import type { Buffer } from 'node:buffer';
import {
	Protocol,
	udpHeaderSize,
	MaxMtuSize,
	UnconnectedPing,
	UnconnectedPong,
	OpenConnectionRequest1,
	OpenConnectionReply1,
	OpenConnectionRequest2,
	OpenConnectionReply2,
	IncompatibleProtocol,
} from '@serenityjs/raknet-protocol';
import type { Server } from './Server';
import { Connection } from './connection';
import type { NetworkIdentifier } from './types';

class Offline {
	public static server: Server;

	public static incoming(buffer: Buffer, identifier: NetworkIdentifier): void {
		// Reads the header of the packet (u8)
		const header = buffer[0];

		// Switches the header of the packet
		// If there is no case for the header, it will log the packet id as unknown
		switch (header) {
			default: {
				const id = header.toString(16).length === 1 ? '0' + header.toString(16) : header.toString(16);
				return console.log(`Caught unhandled offline packet 0x${id} from ${identifier.address}:${identifier.port}!`);
			}

			case UnconnectedPing.ID: {
				return this.handleUnconnectedPing(buffer, identifier);
			}

			case OpenConnectionRequest1.ID: {
				return this.handleOpenConnectionRequest1(buffer, identifier);
			}

			case OpenConnectionRequest2.ID: {
				return this.handleOpenConnectionRequest2(buffer, identifier);
			}
		}
	}

	private static handleUnconnectedPing(buffer: Buffer, identifier: NetworkIdentifier): void {
		// Creates a new UnconnectedPing instance and deserializes the buffer, and then creates a new UnconnectedPong instance
		const ping = new UnconnectedPing(buffer).deserialize();
		const pong = new UnconnectedPong();

		// Sets the properties of the pong packet
		pong.timestamp = ping.timestamp;
		pong.serverGuid = this.server.guid;
		pong.magic = ping.magic;
		pong.motd =
			[
				'MCPE', // MCEE = Minecraft: Education Edition
				this.server.motd!,
				this.server.protocol,
				this.server.version,
				this.server.connections.size,
				this.server.maxConnections,
				this.server.guid,
				'Serenity Raknet Server',
				'survival',
				1,
				this.server.port,
				this.server.port + 1,
			].join(';') + ';';

		// Sends the pong packet to the network identifier
		return this.server.send(pong.serialize(), identifier);
	}

	private static handleOpenConnectionRequest1(buffer: Buffer, identifier: NetworkIdentifier): void {
		// Creates a new OpenConnectionRequest1 instance and deserializes the buffer, and then creates a new OpenConnectionReply1 instance
		const request = new OpenConnectionRequest1(buffer).deserialize();

		// Checks if the protocol is supported
		if (request.protocol !== Protocol) {
			const decline = new IncompatibleProtocol();
			decline.protocol = Protocol;
			decline.magic = request.magic;
			decline.serverGuid = this.server.guid;
			return this.server.send(decline.serialize(), identifier);
		}

		// Create a new reply packet
		// And set the properties of the reply packet
		const reply = new OpenConnectionReply1();
		reply.magic = request.magic;
		reply.serverGuid = this.server.guid;
		reply.useSecurity = false;

		// Check the connections MTU size
		// And adjust if it is larger than the standard Raknet MTU size
		// MTU size is calculated by adding the size of the packet to the size of the UDP header
		const size = request.getBuffer().byteLength + udpHeaderSize;
		if (size > MaxMtuSize) reply.mtu = MaxMtuSize;
		else reply.mtu = size;

		// Send the reply packet to the network identifier
		return this.server.send(reply.serialize(), identifier);
	}

	private static handleOpenConnectionRequest2(buffer: Buffer, identifier: NetworkIdentifier): void {
		// Creates a new OpenConnectionRequest2 instance and deserializes the buffer, and then creates a new OpenConnectionReply2 instance
		const request = new OpenConnectionRequest2(buffer).deserialize();
		const key = `${identifier.address}:${identifier.port}:${identifier.version}`;

		// Check if the connection is already connected
		if (this.server.connections.has(key)) {
			// TODO: Send already connected packet
			return;
		}

		// Create a new reply packet
		// And set the properties of the reply packet
		const reply = new OpenConnectionReply2();
		reply.serverGuid = this.server.guid;
		reply.clientAddress = identifier;
		reply.mtu = request.mtu;
		reply.useEncryption = false;

		// Create the new connection, and add it to the connections map
		const connection = new Connection(this.server, identifier, request.mtu, request.clientGuid);
		this.server.connections.set(key, connection);

		// Send the reply packet to the network identifier
		return this.server.send(reply.serialize(), identifier);
	}
}

export { Offline };
