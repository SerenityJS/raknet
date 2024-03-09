import { Buffer } from 'node:buffer';
import { Long } from '@serenityjs/binaryutils';
import { BasePacket, Packet, Serialize } from '../BasePacket.js';
import { Magic } from '../types/index.js';

@Packet(0x01)
class UnconnectedPing extends BasePacket {
	@Serialize(Long) public timestamp!: bigint;
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Long) public clientGuid!: bigint;
}

export { UnconnectedPing };
