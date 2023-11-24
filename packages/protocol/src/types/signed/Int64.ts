import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 64 bit ( 8 byte ) signed integer ( -9223372036854775808 to 9223372036854775807 )
 */
export class Int64 extends DataType {
	public static read(stream: BinaryStream, endian: Endianness): bigint {
		return stream.readInt64(endian);
	}

	public static write(stream: BinaryStream, value: bigint, endian: Endianness): void {
		stream.writeInt64(value, endian);
	}
}
