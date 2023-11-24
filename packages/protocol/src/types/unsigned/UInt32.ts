import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 32 bit ( 4 byte ) unsigned integer ( 0 to 4294967295 )
 */
export class UInt32 extends DataType {
	public static read(stream: BinaryStream, endian: Endianness): number {
		return stream.readUint32(endian);
	}

	public static write(stream: BinaryStream, value: number, endian: Endianness): void {
		stream.writeUint32(value, endian);
	}
}
