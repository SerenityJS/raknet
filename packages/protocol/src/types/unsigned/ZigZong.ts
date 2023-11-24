import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '../DataType';

/**
 * Reads or writes a 64 bit ( 8 byte ) signed zigzag encoded variable length integer ( -9223372036854775808 to 9223372036854775807 )
 */
export class ZigZong extends DataType {
	public static read(stream: BinaryStream): bigint {
		return stream.readZigZong();
	}

	public static write(stream: BinaryStream, value: bigint): void {
		stream.writeZigZong(value);
	}
}
