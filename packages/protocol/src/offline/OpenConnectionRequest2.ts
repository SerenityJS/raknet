import { Buffer } from 'node:buffer';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Long, Short, Magic, Address, ServerAddress } from '../types';

@Packet(0x07)
class OpenConnectionRequest2 extends BasePacket {
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Address) public serverAddress!: ServerAddress;
	@Serialize(Short) public mtu!: number;
	@Serialize(Long) public clientGuid!: bigint;
}

export { OpenConnectionRequest2 };
