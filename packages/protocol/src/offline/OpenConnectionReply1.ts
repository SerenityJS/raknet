import { Buffer } from 'node:buffer';
import { Long, Bool, Short } from '@serenityjs/binarystream';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Magic } from '../types';

@Packet(0x06)
class OpenConnectionReply1 extends BasePacket {
	@Serialize(Magic) public magic!: Buffer;
	@Serialize(Long) public serverGuid!: bigint;
	@Serialize(Bool) public useSecurity!: boolean;
	@Serialize(Short) public mtu!: number;
}

export { OpenConnectionReply1 };
