import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 8 bit ( 1 byte ) signed integer ( -128 to 127 )
 */
export class Int8 extends DataType {
	public static read(stream: BinaryStream): number {
		return stream.readInt8();
	}

	public static write(stream: BinaryStream, value: number): void {
		stream.writeInt8(value);
	}
}
