import type { Buffer } from 'node:buffer';
import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from './DataType';

/**
 * Reads or writes a raw buffer
 */
export class RawBuffer extends DataType {
	public static read(stream: BinaryStream, length: number): Buffer {
		return stream.readBuffer(length);
	}

	public static write(stream: BinaryStream, value: Buffer): void {
		stream.writeBuffer(value);
	}
}
