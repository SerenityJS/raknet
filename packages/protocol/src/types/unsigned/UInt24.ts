import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 24 bit ( 3 byte ) unsigned integer ( 0 to 16777215 )
 */
export class UInt24 extends DataType {
	public static read(stream: BinaryStream, endian: Endianness): number {
		return stream.readUint24(endian);
	}

	public static write(stream: BinaryStream, value: number, endian: Endianness): void {
		stream.writeUint24(value, endian);
	}
}
