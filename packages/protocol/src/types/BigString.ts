import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from './DataType';

/**
 * Reads or writes a 32 bit big endian string encoded in UTF8
 */
export class BigString extends DataType {
	public static read(stream: BinaryStream): string {
		return stream.readBigString();
	}

	public static write(stream: BinaryStream, value: string): void {
		stream.writeBigString(value);
	}
}
