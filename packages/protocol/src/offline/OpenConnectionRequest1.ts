import { Buffer } from 'node:buffer';
import { Uint8 } from '@serenityjs/binaryutils';
import { BasePacket, Packet, Serialize } from '../BasePacket.js';
import { Magic, MTU } from '../types/index.js';

@Packet(0x05)
class OpenConnectionRequest1 extends BasePacket {
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Uint8) public protocol!: number;
	@Serialize(MTU) public mtu!: number;
}

export { OpenConnectionRequest1 };
