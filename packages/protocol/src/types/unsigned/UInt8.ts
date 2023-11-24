import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 8 bit ( 1 byte ) unsigned integer ( 0 to 255 )
 */
export class UInt8 extends DataType {
	public static read(stream: BinaryStream): number {
		return stream.readUint8();
	}

	public static write(stream: BinaryStream, value: number): void {
		stream.writeUint8(value);
	}
}
