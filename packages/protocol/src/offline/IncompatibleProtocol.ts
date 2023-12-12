import { Buffer } from 'node:buffer';
import { Uint8, Long } from '@serenityjs/binarystream';
import { Packet, BasePacket, Serialize } from '../BasePacket';
import { Magic } from '../types';

@Packet(0x19)
class IncompatibleProtocol extends BasePacket {
	@Serialize(Uint8) public protocol!: number;
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Long) public serverGuid!: bigint;
}

export { IncompatibleProtocol };
