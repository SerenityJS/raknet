import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from './DataType';

/**
 * Reads or writes a 32 bit little endian string encoded in ASCII
 */
export class LittleString extends DataType {
	public static read(stream: BinaryStream): string {
		return stream.readLittleString();
	}

	public static write(stream: BinaryStream, value: string): void {
		stream.writeLittleString(value);
	}
}
