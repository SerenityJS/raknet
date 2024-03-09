import { Buffer } from 'node:buffer';
import { Long, Short, Bool } from '@serenityjs/binaryutils';
import { BasePacket, Packet, Serialize } from '../BasePacket.js';
import { Magic, Address, ServerAddress } from '../types/index.js';

@Packet(0x08)
class OpenConnectionReply2 extends BasePacket {
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Long) public serverGuid!: bigint;
	@Serialize(Address) public clientAddress!: ServerAddress;
	@Serialize(Short) public mtu!: number;
	@Serialize(Bool) public useEncryption!: boolean;
}

export { OpenConnectionReply2 };
