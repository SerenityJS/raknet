import { Buffer } from 'node:buffer';
import { Packet, BasePacket, Serialize } from '../BasePacket';
import { Long, Magic, UInt8 } from '../types';

@Packet(0x19)
class IncompatibleProtocol extends BasePacket {
	@Serialize(UInt8) public protocol!: number;
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Long) public serverGuid!: bigint;
}

export { IncompatibleProtocol };
