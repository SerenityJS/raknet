import { Buffer } from 'node:buffer';
import { Uint8, Long } from '@serenityjs/binaryutils';
import { Packet, BasePacket, Serialize } from '../BasePacket.js';
import { Magic } from '../types/index.js';

@Packet(0x19)
class IncompatibleProtocol extends BasePacket {
	@Serialize(Uint8) public protocol!: number;
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Long) public serverGuid!: bigint;
}

export { IncompatibleProtocol };
