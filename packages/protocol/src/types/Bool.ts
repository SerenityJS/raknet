import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from './DataType';

/**
 * Reads or writes a boolean
 */
export class Bool extends DataType {
	public static read(stream: BinaryStream): boolean {
		return stream.readBool();
	}

	public static write(stream: BinaryStream, value: boolean): void {
		stream.writeBool(value);
	}
}
