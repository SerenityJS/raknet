import { Endianness, Uint24 } from '@serenityjs/binarystream';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Frames } from '../types';
import type { Frame } from './Frame';

@Packet(0x80)
class FrameSet extends BasePacket {
	@Serialize(Uint24, Endianness.Little) public sequence!: number;
	@Serialize(Frames) public frames!: Frame[];
}

export { FrameSet };
