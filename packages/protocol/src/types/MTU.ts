import { Buffer } from 'node:buffer';
import { DataType } from '@serenityjs/binarystream';
import type { BinaryStream } from '@serenityjs/binarystream';

class MTU extends DataType {
	public static override read(stream: BinaryStream): number {
		return stream.getBuffer().length;
	}

	public static override write(stream: BinaryStream, value: number): void {
		stream.writeBuffer(Buffer.alloc(value - stream.getBuffer().length));
	}
}

export { MTU };
