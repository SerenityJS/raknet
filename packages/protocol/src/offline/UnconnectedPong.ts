import { Buffer } from 'node:buffer';
import { Long, String16, Endianness } from '@serenityjs/binaryutils';
import { BasePacket, Packet, Serialize } from '../BasePacket.js';
import { Magic } from '../types/index.js';

@Packet(0x1c)
class UnconnectedPong extends BasePacket {
	@Serialize(Long) public timestamp!: bigint;
	@Serialize(Long) public serverGuid!: bigint;
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(String16, Endianness.Big) public motd!: string;
}

export { UnconnectedPong };
