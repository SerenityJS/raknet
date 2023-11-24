import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 16 bit ( 2 byte ) unsigned integer ( 0 to 65535 )
 */
export class UShort extends DataType {
	public static read(stream: BinaryStream, endian: Endianness): number {
		return stream.readUShort(endian);
	}

	public static write(stream: BinaryStream, value: number, endian: Endianness): void {
		stream.writeUShort(value, endian);
	}
}
