import { Buffer } from 'node:buffer';
import { DataType } from '@serenityjs/binarystream';
import type { BinaryStream } from '@serenityjs/binarystream';
import { MagicBytes } from '../constants';

const MagicBuffer = Buffer.from(MagicBytes, 'binary');

class Magic extends DataType {
	public static override read(stream: BinaryStream): Buffer {
		return stream.readBuffer(MagicBuffer.length);
	}
	public static override write(stream: BinaryStream): void {
		stream.writeBuffer(MagicBuffer);
	}
}

export { Magic };
