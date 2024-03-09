import type { BinaryStream } from '@serenityjs/binaryutils';
import { Endianness } from '@serenityjs/binaryutils';

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
