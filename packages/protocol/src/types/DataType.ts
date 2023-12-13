import type { BinaryStream, Uint16 } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';

abstract class DataType {
	public static read(stream: BinaryStream, endian: Endianness | null | undefined = Endianness.Big, param?: any): any {
		throw new Error('DataType.read() is not implemented.');
	}

	public static write(
		stream: BinaryStream,
		value: any,
		endian: Endianness | null | undefined = Endianness.Big,
		param?: any,
	): void {
		throw new Error('DataType.write() is not implemented.');
	}
}

export { DataType };
