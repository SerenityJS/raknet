import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';

export abstract class DataType {
	public static read(stream: BinaryStream, endian: Endianness = Endianness.Big, value?: any): any {
		throw new Error('DataType.read() is not implemented');
	}
	public static write(stream: BinaryStream, value: any, endian: Endianness = Endianness.Big, value2?: any): void {
		throw new Error('DataType.write() is not implemented');
	}
}
