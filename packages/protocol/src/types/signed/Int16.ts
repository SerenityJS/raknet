import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 16 bit ( 2 byte ) signed integer ( -32768 to 32767 )
 */
export class Int16 extends DataType {
	public static read(stream: BinaryStream, endian?: Endianness): number {
		return stream.readInt16(endian);
	}

	public static write(stream: BinaryStream, value: number, endian?: Endianness): void {
		stream.writeInt16(value, endian);
	}
}
