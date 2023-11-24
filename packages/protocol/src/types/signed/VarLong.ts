import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 64 bit ( 8 bytes ) unsigned variable length integer ( -9223372036854775808 to 9223372036854775807 )
 */
export class VarLong extends DataType {
	public static read(stream: BinaryStream): bigint {
		return stream.readVarLong();
	}

	public static write(stream: BinaryStream, value: bigint): void {
		stream.writeVarLong(value);
	}
}
