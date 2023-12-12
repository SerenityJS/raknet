import { Buffer } from 'node:buffer';
import { Long } from '@serenityjs/binarystream';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Magic } from '../types';

@Packet(0x01)
class UnconnectedPing extends BasePacket {
	@Serialize(Long) public timestamp!: bigint;
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Long) public clientGuid!: bigint;
}

export { UnconnectedPing };
