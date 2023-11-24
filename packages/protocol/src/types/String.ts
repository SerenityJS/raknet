import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from './DataType';

/**
 * Still a string, didnt want to extend the String proto
 */
export class LitString extends DataType {
	public static read(stream: BinaryStream): string {
		return stream.readString();
	}

	public static write(stream: BinaryStream, value: string): void {
		stream.writeString(value);
	}
}
