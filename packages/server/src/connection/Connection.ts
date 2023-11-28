import { Buffer } from 'node:buffer';
import { BinaryStream } from '@serenityjs/binarystream';
import {
	Frame,
	Bitflags,
	Priority,
	FrameSet,
	Ack,
	Nack,
	Status,
	Disconnect,
	ConnectionRequest,
	ConnectionRequestAccepted,
	ConnectedPing,
	ConnectedPong,
	Reliability,
	NewIncomingConnection,
} from '@serenityjs/raknet-protocol';
import type { Server } from '../Server';
import type { NetworkIdentifier } from '../types';

/**
 * **Connection**
 *
 * Creates a new connection.
 */
class Connection {
	protected readonly server: Server;
	protected status = Status.Connecting;
	/**
	 * **identifier**
	 *
	 * The network identifier of the connection.
	 */
	public readonly identifier: NetworkIdentifier;
	/**
	 * **mtu**
	 *
	 * The maximum transmission unit size for the connection.
	 */
	public readonly mtu: number;
	/**
	 * **guid**
	 *
	 * The guid of the connection.
	 */
	public readonly guid: bigint;

	// Inputs
	protected readonly receivedFrameSequences = new Set<number>();
	protected readonly lostFrameSequences = new Set<number>();
	protected readonly inputHighestSequenceIndex: number[];
	protected readonly fragmentsQueue: Map<number, Map<number, Frame>> = new Map();
	protected readonly inputOrderIndex: number[];
	protected inputOrderingQueue: Map<number, Map<number, Frame>> = new Map();
	protected lastInputSequence = -1;

	// Outputs
	protected readonly outputBackupQueue = new Map<number, Frame[]>();
	protected readonly outputOrderIndex: number[];
	protected readonly outputSequenceIndex: number[];
	protected outputFrameQueue: FrameSet;
	protected outputSequence = 0;
	protected outputReliableIndex = 0;
	protected outputFragmentIndex = 0;

	/**
	 * Creates a new connection.
	 *
	 * @param {Server} server - The server instance
	 * @param {NetworkIdentifier} identifier - The network identifier
	 * @param {number} mtu - The maximum transmission unit size
	 * @param {bigint} guid - The guid of the connection
	 */
	public constructor(server: Server, identifier: NetworkIdentifier, mtu: number, guid: bigint) {
		this.server = server;
		this.identifier = identifier;
		this.mtu = mtu;
		this.guid = guid;

		// Inputs
		this.inputOrderIndex = Array.from<number>({ length: 32 }).fill(0);
		for (let i = 0; i < 32; i++) {
			this.inputOrderingQueue.set(i, new Map());
		}

		this.inputHighestSequenceIndex = Array.from<number>({ length: 32 }).fill(0);

		// Outputs
		this.outputFrameQueue = new FrameSet();
		this.outputFrameQueue.frames = [];
		this.outputOrderIndex = Array.from<number>({ length: 32 }).fill(0);
		this.outputSequenceIndex = Array.from<number>({ length: 32 }).fill(0);
	}

	/**
	 * **getStatus**
	 *
	 * Gets the status of the connection.
	 *
	 * @returns {Status} The status of the connection
	 */
	public getStatus(): Status {
		return this.status;
	}

	/**
	 * **tick**
	 *
	 * Ticks the connection.
	 * Sends ACKs, NACKs and the output queue.
	 *
	 * @returns {void}
	 */
	public tick(): void {
		// Check if the client is disconnecting or disconnected
		if (this.status === Status.Disconnecting || this.status === Status.Disconnected) return;

		// Check if we have received any ACKs or NACKs
		// Check if we have received any packets to send an ACK for
		if (this.receivedFrameSequences.size > 0) {
			const ack = new Ack();
			ack.sequences = [...this.receivedFrameSequences].map((x) => {
				this.receivedFrameSequences.delete(x);
				return x;
			});
			this.send(ack.serialize());
		}

		// Check if we have any lost packets to send a NACK for
		if (this.lostFrameSequences.size > 0) {
			const pk = new Nack();
			pk.sequences = [...this.lostFrameSequences].map((x) => {
				this.lostFrameSequences.delete(x);
				return x;
			});
			this.send(pk.serialize());
		}

		// Send the output queue
		return this.sendFrameQueue();
	}

	/**
	 * **send**
	 *
	 * Sends a buffer to the network identifier.
	 *
	 * @param {Buffer} buffer - The buffer to send
	 */
	public send(buffer: Buffer): void {
		this.server.send(buffer, this.identifier);
	}

	/**
	 * **disconnect**
	 *
	 * Disconnects the connection.
	 *
	 * @returns {void}
	 */
	public disconnect(): void {
		// Set the status to disconnecting
		this.status = Status.Disconnecting;

		// Create a new Disconnect instance
		const disconnect = new Disconnect();

		// Construct the frame
		const frame = new Frame();
		frame.reliability = Reliability.Unreliable;
		frame.orderChannel = 0;
		frame.body = disconnect.serialize();
		// Send the frame
		this.sendFrame(frame, Priority.Immediate);

		// Emit the disconnect event, and delete the connection from the connections map
		this.server.emit('disconnect', this);
		const key = `${this.identifier.address}:${this.identifier.port}:${this.identifier.version}`;
		this.server.connections.delete(key);

		// Set the status to disconnected
		this.status = Status.Disconnected;
	}

	/**
	 * **incoming**
	 *
	 * Handles an incoming buffer.
	 *
	 * @param {Buffer} buffer - The buffer to handle
	 */
	public incoming(buffer: Buffer): void {
		// Reads the header of the packet (u8)
		// And masks it with 0xf0 to get the header
		const header = buffer[0] & 0xf0;

		// Switches the header of the packet
		// If there is no case for the header, it will log the packet id as unknown
		switch (header) {
			default: {
				const id = header.toString(16).length === 1 ? '0' + header.toString(16) : header.toString(16);
				return console.log(
					`Caught unhandled online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`,
				);
			}

			case Ack.ID: {
				return this.handleIncomingAck(buffer);
			}

			case Nack.ID: {
				return this.handleIncomingNack(buffer);
			}

			case Bitflags.Valid: {
				return this.handleIncomingFrameSet(buffer);
			}
		}
	}

	/**
	 * **incomingBatch**
	 *
	 * Handles an incoming buffer.
	 *
	 * @param {Buffer} buffer - The buffer to handle
	 */
	public incomingBatch(buffer: Buffer): void {
		// Reads the header of the packet (u8)
		const header = buffer[0];

		// Check if the connection is still connecting
		if (this.status === Status.Connecting) {
			switch (header) {
				default: {
					const id = header.toString(16).length === 1 ? '0' + header.toString(16) : header.toString(16);
					return console.log(
						`Caught unhandled online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`,
					);
				}

				case Disconnect.ID: {
					this.status = Status.Disconnecting;
					const key = `${this.identifier.address}:${this.identifier.port}:${this.identifier.version}`;
					this.server.connections.delete(key);
					this.status = Status.Disconnected;
					break;
				}

				case ConnectionRequest.ID: {
					return this.handleIncomingConnectionRequest(buffer);
				}

				case NewIncomingConnection.ID: {
					this.status = Status.Connected;
					this.server.emit('connect', this);
					break;
				}
			}

			return;
		}

		// Handle the connected packets
		switch (header) {
			default: {
				const id = header.toString(16).length === 1 ? '0' + header.toString(16) : header.toString(16);
				return console.log(
					`Caught unhandled online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`,
				);
			}

			case Disconnect.ID: {
				this.status = Status.Disconnecting;
				this.server.emit('disconnect', this);
				const key = `${this.identifier.address}:${this.identifier.port}:${this.identifier.version}`;
				this.server.connections.delete(key);
				this.status = Status.Disconnected;
				break;
			}

			case ConnectedPing.ID: {
				return this.handleIncomingConnectedPing(buffer);
			}

			case 0xfe: {
				this.server.emit('encapsulated', this, buffer);
			}
		}
	}

	private handleIncomingAck(buffer: Buffer): void {
		// Create a new Ack instance and deserialize the buffer
		const ack = new Ack(buffer).deserialize();

		// Checks if the ack has any sequences, and removes them from the output backup queue
		if (ack.sequences.length > 0) {
			for (const sequence of ack.sequences) {
				this.outputBackupQueue.delete(sequence);
			}
		}
	}

	private handleIncomingNack(buffer: Buffer): void {
		// Create a new Nack instance and deserialize the buffer
		const nack = new Nack(buffer).deserialize();

		// Checks if the nack has any sequences, and resends them from the output backup queue
		if (nack.sequences.length > 0) {
			for (const sequence of nack.sequences) {
				if (this.outputBackupQueue.has(sequence)) {
					// Gets the lost frames and sends them again
					const frames = this.outputBackupQueue.get(sequence)!;
					for (const frame of frames) {
						this.sendFrame(frame, Priority.Immediate);
					}
				}
			}
		}
	}

	private handleIncomingFrameSet(buffer: Buffer): void {
		// Create a new FrameSet instance and deserialize the buffer
		const frameset = new FrameSet(buffer).deserialize();

		// Checks if the sequence of the frameset has already been recieved
		if (this.receivedFrameSequences.has(frameset.sequence)) {
			return console.log(
				`Recieved duplicate frameset ${frameset.sequence} from ${this.identifier.address}:${this.identifier.port}!`,
			);
		}

		// Removes the sequence from the lost frame sequences
		this.lostFrameSequences.delete(frameset.sequence);

		// Checks if the sequence is out of order
		if (frameset.sequence < this.lastInputSequence || frameset.sequence === this.lastInputSequence) {
			return console.log(
				`Recieved out of order frameset ${frameset.sequence} from ${this.identifier.address}:${this.identifier.port}!`,
			);
		}

		// Adds the sequence to the recieved frame sequences, Ack will be sent on next tick
		this.receivedFrameSequences.add(frameset.sequence);

		// Checks if there are any missings framesets,
		// in the range of the last input sequence and the current sequence
		const diff = frameset.sequence - this.lastInputSequence;
		if (diff !== 1) {
			// Check if we are missing more than one packet
			for (let i = this.lastInputSequence + 1; i < frameset.sequence; i++) {
				// Add the missing packet to the lost queue
				// Nack will be sent on the next tick
				if (!this.receivedFrameSequences.has(i)) {
					this.lostFrameSequences.add(i);
				}
			}
		}

		// Set the last input sequence to the current sequence
		this.lastInputSequence = frameset.sequence;

		// Handle the frames
		for (const frame of frameset.frames) {
			this.handleFrame(frame);
		}
	}

	private handleFrame(frame: Frame): void {
		// Checks if the packet is fragmented
		if (frame.isFragmented()) return this.handleFragment(frame);

		// Checks if the packet is sequenced
		if (frame.isSequenced()) {
			if (
				frame.sequenceIndex < this.inputHighestSequenceIndex[frame.orderChannel] ||
				frame.orderIndex < this.inputOrderIndex[frame.orderChannel]
			) {
				return console.log(
					`Recieved out of order frame ${frame.sequenceIndex} from ${this.identifier.address}:${this.identifier.port}!`,
				);
			}

			// Set the new highest sequence index
			this.inputHighestSequenceIndex[frame.orderChannel] = frame.sequenceIndex + 1;
			// Handle the packet
			return this.incomingBatch(frame.body);
		} else if (frame.isOrdered()) {
			// Check if the packet is out of order
			if (frame.orderIndex === this.inputOrderIndex[frame.orderChannel]) {
				this.inputHighestSequenceIndex[frame.orderChannel] = 0;
				this.inputOrderIndex[frame.orderChannel] = frame.orderIndex + 1;

				// Handle the packet
				this.incomingBatch(frame.body);
				let i = this.inputOrderIndex[frame.orderChannel];
				const outOfOrderQueue = this.inputOrderingQueue.get(frame.orderChannel)!;
				for (; outOfOrderQueue.has(i); i++) {
					this.incomingBatch(outOfOrderQueue.get(i)!.body);
					outOfOrderQueue.delete(i);
				}

				// Update the queue
				this.inputOrderingQueue.set(frame.orderChannel, outOfOrderQueue);
				this.inputOrderIndex[frame.orderChannel] = i;
			} else if (frame.orderIndex > this.inputOrderIndex[frame.orderChannel]) {
				const unordered = this.inputOrderingQueue.get(frame.orderChannel)!;
				unordered.set(frame.orderIndex, frame);
			}
		} else {
			// Handle the packet, no need to format it
			return this.incomingBatch(frame.body);
		}
	}

	private handleFragment(frame: Frame): void {
		// Check if we already have the fragment id
		if (this.fragmentsQueue.has(frame.fragmentId)) {
			const value = this.fragmentsQueue.get(frame.fragmentId)!;
			value.set(frame.fragmentIndex, frame);

			// Check if we have all the fragments
			// Then we can rebuild the packet
			if (value.size === frame.fragmentSize) {
				const stream = new BinaryStream();
				// Loop through the fragments and write them to the stream
				for (let i = 0; i < value.size; i++) {
					const splitPacket = value.get(i)!;
					stream.writeBuffer(splitPacket.body);
				}

				// Construct the new frame
				// Assign the values from the original frame
				const newFrame = new Frame();
				newFrame.reliability = frame.reliability;
				newFrame.reliableIndex = frame.reliableIndex;
				newFrame.sequenceIndex = frame.sequenceIndex;
				newFrame.orderIndex = frame.orderIndex;
				newFrame.orderChannel = frame.orderChannel;
				newFrame.body = stream.getBuffer();
				// Delete the fragment id from the queue
				this.fragmentsQueue.delete(frame.fragmentId);
				// Send the new frame to the handleFrame function
				return this.handleFrame(newFrame);
			}
		} else {
			// Add the fragment id to the queue
			this.fragmentsQueue.set(frame.fragmentId, new Map([[frame.fragmentIndex, frame]]));
		}
	}

	/**
	 * **sendFrame**
	 *
	 * Sends a frame to the connection.
	 *
	 * @param {Frame} frame - The frame to send
	 * @param {Priority} priority - The priority of the frame
	 * @returns {void}
	 */
	public sendFrame(frame: Frame, priority: Priority): void {
		// Check if the packet is sequenced or ordered
		if (frame.isSequenced()) {
			// Set the order index and the sequence index
			frame.orderIndex = this.outputOrderIndex[frame.orderChannel];
			frame.sequenceIndex = this.outputSequenceIndex[frame.orderChannel]++;
		} else if (frame.isOrderExclusive()) {
			// Set the order index and the sequence index
			frame.orderIndex = this.outputOrderIndex[frame.orderChannel]++;
			this.outputSequenceIndex[frame.orderChannel] = 0;
		}

		// Set the reliable index
		frame.reliableIndex = this.outputReliableIndex++;

		// Split packet if bigger than MTU size
		const maxSize = this.mtu - 6 - 23;
		if (frame.body.byteLength > maxSize) {
			const buffer = Buffer.from(frame.body);
			const fragmentId = this.outputFragmentIndex++ % 65_536;
			for (let i = 0; i < buffer.byteLength; i += maxSize) {
				if (i !== 0) frame.reliableIndex = this.outputReliableIndex++;

				frame.body = buffer.slice(i, i + maxSize);
				frame.fragmentIndex = i / maxSize;
				frame.fragmentId = fragmentId;
				frame.fragmentSize = Math.ceil(buffer.byteLength / maxSize);
				this.addFrameToQueue(frame, priority | Priority.Immediate);
			}
		} else {
			return this.addFrameToQueue(frame, priority);
		}
	}

	private addFrameToQueue(frame: Frame, priority: Priority): void {
		let length = 4;
		// Add the length of the frame to the length
		for (const queuedFrame of this.outputFrameQueue.frames) {
			length += queuedFrame.getByteLength();
		}

		// Check if the frame is bigger than the MTU, if so, send the queue
		if (length + frame.getByteLength() > this.mtu - 36) {
			this.sendFrameQueue();
		}

		// Add the frame to the queue
		this.outputFrameQueue.frames.push(frame);

		// If the priority is immediate, send the queue
		if (priority === Priority.Immediate) return this.sendFrameQueue();
	}

	private sendFrameQueue(): void {
		// Check if the queue is empty
		if (this.outputFrameQueue.frames.length > 0) {
			// Set the sequence of the frame set
			this.outputFrameQueue.sequence = this.outputSequence++;
			// Send the frame set
			this.sendFrameSet(this.outputFrameQueue);
			// Set the queue to a new frame set
			this.outputFrameQueue = new FrameSet();
			this.outputFrameQueue.frames = [];
		}
	}

	private sendFrameSet(frameset: FrameSet): void {
		// Send the frame set
		this.send(frameset.serialize());
		// Add the frame set to the backup queue
		this.outputBackupQueue.set(
			frameset.sequence,
			frameset.frames.filter((frame) => frame.isReliable()),
		);
	}

	private handleIncomingConnectionRequest(buffer: Buffer): void {
		// Create a new ConnectionRequest instance and deserialize the buffer
		const request = new ConnectionRequest(buffer).deserialize();

		// Check if the server is full
		if (this.server.connections.size >= this.server.maxConnections) {
			return this.disconnect();
		}

		// Create a new ConnectionRequestAccepted instance
		const accepted = new ConnectionRequestAccepted();

		// Set the properties of the accepted packet
		accepted.clientAddress = this.identifier;
		accepted.systemIndex = 0;
		accepted.systemAddresses = [];
		accepted.requestTimestamp = request.timestamp;
		accepted.timestamp = BigInt(Date.now());

		// Set the accepted packet to a new frame
		const frame = new Frame();
		frame.reliability = Reliability.Unreliable;
		frame.orderChannel = 0;
		frame.body = accepted.serialize();

		// Send the frame
		return this.sendFrame(frame, Priority.Immediate);
	}

	private handleIncomingConnectedPing(buffer: Buffer): void {
		// Create a new ConnectedPing instance and deserialize the buffer
		const ping = new ConnectedPing(buffer).deserialize();
		const pong = new ConnectedPong();
		pong.timestamp = ping.timestamp;
		pong.pingTimestamp = ping.timestamp;
		pong.timestamp = BigInt(Date.now());

		const frame = new Frame();
		frame.reliability = Reliability.Unreliable;
		frame.orderChannel = 0;
		frame.body = pong.serialize();

		this.sendFrame(frame, Priority.Normal);
	}
}

export { Connection };
