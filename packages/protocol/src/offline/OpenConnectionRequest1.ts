import { Buffer } from 'node:buffer';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { UInt8, Magic, MTU } from '../types';

@Packet(0x05)
class OpenConnectionRequest1 extends BasePacket {
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(UInt8) public protocol!: number;
	@Serialize(MTU) public mtu!: number;
}

export { OpenConnectionRequest1 };
