import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 64 bit ( 8 byte ) unsigned integer ( 0 to 18446744073709551615 )
 */
export class ULong extends DataType {
	public static read(stream: BinaryStream, endian: Endianness): bigint {
		return stream.readULong(endian);
	}

	public static write(stream: BinaryStream, value: bigint, endian: Endianness): void {
		stream.writeULong(value, endian);
	}
}
