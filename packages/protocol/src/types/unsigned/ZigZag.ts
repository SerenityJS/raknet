import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 32 bit ( 4 bytes ) signed zigzag encoded variable length integer ( -2147483648 to 2147483647 )
 */
export class ZigZag extends DataType {
	public static read(stream: BinaryStream): number {
		return stream.readZigZag();
	}

	public static write(stream: BinaryStream, value: number): void {
		stream.writeZigZag(value);
	}
}
