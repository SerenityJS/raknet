import type { BinaryStream } from '@serenityjs/binarystream';
import { Frame } from '../frame/index.js';
import { DataType } from './DataType.js';

class Frames extends DataType {
	public static override read(stream: BinaryStream): Frame[] {
		const frames: Frame[] = [];
		do {
			const frame = new Frame(stream).deserialize();
			frames.push(frame);
		} while (!stream.cursorAtEnd());

		return frames;
	}
	public static override write(stream: BinaryStream, value: Frame[]): void {
		for (const frame of value) {
			stream.writeBuffer(frame.serialize());
		}
	}
}

export { Frames };
