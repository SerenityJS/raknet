import { Buffer } from 'node:buffer';
import type { BinaryStream } from '@serenityjs/binaryutils';
import { MagicBytes } from '../constants/index.js';
import { DataType } from './DataType.js';

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
