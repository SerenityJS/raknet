import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 32 bit ( 4 bytes ) unsigned variable length integer ( -2147483648 to 2147483647 )
 */
export class VarInt extends DataType {
	public static read(stream: BinaryStream): number {
		return stream.readVarInt();
	}

	public static write(stream: BinaryStream, value: number): void {
		stream.writeVarInt(value);
	}
}
