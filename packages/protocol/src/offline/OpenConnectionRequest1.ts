import { Buffer } from 'node:buffer';
import { Uint8 } from '@serenityjs/binarystream';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Magic, MTU } from '../types';

@Packet(0x05)
class OpenConnectionRequest1 extends BasePacket {
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Uint8) public protocol!: number;
	@Serialize(MTU) public mtu!: number;
}

export { OpenConnectionRequest1 };
