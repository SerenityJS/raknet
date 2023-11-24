import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from './DataType';

/**
 * Reads or writes a byte
 */
export class Byte extends DataType {
	public static read(stream: BinaryStream): number {
		return stream.readByte();
	}

	public static write(stream: BinaryStream, value: number): void {
		stream.writeByte(value);
	}
}
