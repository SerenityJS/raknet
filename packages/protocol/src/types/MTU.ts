import { Buffer } from 'node:buffer';
import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from './DataType';

class MTU extends DataType {
	public static override read(stream: BinaryStream): number {
		return stream.getBuffer().length;
	}

	public static override write(stream: BinaryStream, value: number): void {
		stream.writeBuffer(Buffer.alloc(value - stream.getBuffer().length));
	}
}

export { MTU };
