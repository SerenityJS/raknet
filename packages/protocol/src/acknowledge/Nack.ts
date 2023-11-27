import type { Buffer } from 'node:buffer';
import { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { Packet, BasePacket } from '../BasePacket';

@Packet(0xa0)
class Nack extends BasePacket {
	public sequences: number[] = [];

	// Override encode due to custom logic, maybe move into own type?
	public override serialize(): Buffer {
		this.writeUint8(Nack.ID);
		const stream = new BinaryStream();
		const count = this.sequences.length;
		let records = 0;

		if (count > 0) {
			let cursor = 0;
			let start = this.sequences[0];
			let last = this.sequences[0];

			while (cursor < count) {
				const current = this.sequences[cursor++];
				const diff = current - last;
				if (diff === 1) {
					last = current;
				} else if (diff > 1) {
					if (start === last) {
						stream.writeBool(true); // single?
						stream.writeUint24(start, Endianness.Little);
						start = last = current;
					} else {
						stream.writeBool(false); // single?
						stream.writeUint24(start, Endianness.Little);
						stream.writeUint24(last, Endianness.Little);
						start = last = current;
					}

					++records;
				}
			}

			// last iteration
			if (start === last) {
				stream.writeBool(true); // single?
				stream.writeUint24(start, Endianness.Little);
			} else {
				stream.writeBool(false); // single?
				stream.writeUint24(start, Endianness.Little);
				stream.writeUint24(last, Endianness.Little);
			}

			++records;

			this.writeUShort(records);
			this.writeBuffer(stream.getBuffer());
		}

		return this.getBuffer();
	}

	// Override decode due to custom logic, maybe move into own type?
	public override deserialize(): this {
		this.readUint8();
		this.sequences = [];
		const recordCount = this.readUShort();
		for (let i = 0; i < recordCount; i++) {
			const range = this.readBool(); // False for range, True for no range
			if (range) {
				this.sequences.push(this.readUint24(Endianness.Little));
			} else {
				const start = this.readUint24(Endianness.Little);
				const end = this.readUint24(Endianness.Little);
				for (let i = start; i <= end; i++) {
					this.sequences.push(i);
				}
			}
		}

		return this;
	}
}

export { Nack };
