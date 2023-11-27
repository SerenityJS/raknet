import { Endianness } from '@serenityjs/binarystream';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { UInt24, Frames } from '../types';
import type { Frame } from './Frame';

@Packet(0x80)
class FrameSet extends BasePacket {
	@Serialize(UInt24, Endianness.Little) public sequence!: number;
	@Serialize(Frames) public frames!: Frame[];
}

export { FrameSet };
