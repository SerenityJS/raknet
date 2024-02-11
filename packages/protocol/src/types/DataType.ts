import type { BinaryStream, Uint16 } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';

abstract class DataType {
	public constructor(..._args: any) {}

	public static read(
		_stream: BinaryStream,
		_endian: Endianness | null | undefined = Endianness.Big,
		_param?: any,
	): any {}

	public static write(
		_stream: BinaryStream,
		_value: any,
		_endian: Endianness | null | undefined = Endianness.Big,
		_param?: any,
	): void {}
}

export { DataType };
