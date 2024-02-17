import type { Buffer } from 'node:buffer';
import { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { Reliability, Bitflags } from '../constants/index.js';

class Frame {
	protected readonly stream: BinaryStream;

	public reliability!: Reliability;
	public reliableIndex!: number;

	public sequenceIndex!: number;

	public orderIndex!: number;
	public orderChannel!: number;

	public fragmentSize!: number;
	public fragmentId!: number;
	public fragmentIndex!: number;

	public body!: Buffer;

	public constructor(stream?: BinaryStream) {
		this.stream = stream ?? new BinaryStream();
	}

	public serialize(): Buffer {
		const stream = new BinaryStream();

		stream.writeByte((this.reliability << 5) | (this.isFragmented() ? Bitflags.Split : 0));
		stream.writeShort(this.body.byteLength << 3);

		if (this.isReliable()) {
			stream.writeUint24(this.reliableIndex!, Endianness.Little);
		}

		if (this.isSequenced()) {
			stream.writeUint24(this.sequenceIndex!, Endianness.Little);
		}

		if (this.isOrdered()) {
			stream.writeUint24(this.orderIndex!, Endianness.Little);
			stream.writeByte(this.orderChannel);
		}

		if (this.isFragmented()) {
			stream.writeInt32(this.fragmentSize);
			stream.writeShort(this.fragmentId);
			stream.writeInt32(this.fragmentIndex);
		}

		stream.writeBuffer(this.body);

		return stream.getBuffer();
	}

	public deserialize(): this {
		const header = this.stream.readByte();
		this.reliability = (header & 0xe0) >> 5;

		const length = Math.ceil(this.stream.readShort() / 8);

		if (this.isReliable()) {
			this.reliableIndex = this.stream.readUint24(Endianness.Little);
		}

		if (this.isSequenced()) {
			this.sequenceIndex = this.stream.readUint24(Endianness.Little);
		}

		if (this.isOrdered()) {
			this.orderIndex = this.stream.readUint24(Endianness.Little);
			this.orderChannel = this.stream.readByte();
		}

		if ((header & Bitflags.Split) > 0) {
			this.fragmentSize = this.stream.readInt32();
			this.fragmentId = this.stream.readShort();
			this.fragmentIndex = this.stream.readInt32();
		}

		this.body = this.stream.readBuffer(length);

		return this;
	}

	public isFragmented(): boolean {
		return this.fragmentSize > 0;
	}

	public isReliable(): boolean {
		const values = [
			Reliability.Reliable,
			Reliability.ReliableOrdered,
			Reliability.ReliableSequenced,
			Reliability.ReliableWithAckReceipt,
			Reliability.ReliableOrderedWithAckReceipt,
		];

		return values.includes(this.reliability);
	}

	public isSequenced(): boolean {
		const values = [Reliability.ReliableSequenced, Reliability.UnreliableSequenced];

		return values.includes(this.reliability);
	}

	public isOrdered(): boolean {
		const values = [
			Reliability.UnreliableSequenced,
			Reliability.ReliableOrdered,
			Reliability.ReliableSequenced,
			Reliability.ReliableOrderedWithAckReceipt,
		];

		return values.includes(this.reliability);
	}

	public isOrderExclusive(): boolean {
		const values = [Reliability.ReliableOrdered, Reliability.ReliableOrderedWithAckReceipt];

		return values.includes(this.reliability);
	}

	public getByteLength(): number {
		return (
			3 +
			this.body.byteLength +
			(this.isReliable() ? 3 : 0) +
			(this.isSequenced() ? 3 : 0) +
			(this.isOrdered() ? 4 : 0) +
			(this.isFragmented() ? 10 : 0)
		);
	}
}

export { Frame };
