import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from './DataType';

/**
 * Reads or writes a 32 bit float
 */
export class Float32 extends DataType {
	public static read(stream: BinaryStream, endian: Endianness = Endianness.Big): number {
		return stream.readFloat32(endian);
	}

	public static write(stream: BinaryStream, value: number, endian: Endianness = Endianness.Big): void {
		stream.writeFloat32(value, endian);
	}
}
