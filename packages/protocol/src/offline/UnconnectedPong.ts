import { Buffer } from 'node:buffer';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Long, LitString, Magic } from '../types';

@Packet(0x1c)
class UnconnectedPong extends BasePacket {
	@Serialize(Long) public timestamp!: bigint;
	@Serialize(Long) public serverGuid!: bigint;
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(LitString) public motd!: string;
}

export { UnconnectedPong };
