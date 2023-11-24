import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 16 bit ( 2 byte ) signed integer ( -32768 to 32767 )
 */
export class Short extends DataType {
	public static read(stream: BinaryStream, endian: Endianness): number {
		return stream.readShort(endian);
	}

	public static write(stream: BinaryStream, value: number, endian: Endianness): void {
		stream.writeShort(value, endian);
	}
}
