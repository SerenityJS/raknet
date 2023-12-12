import { Long } from '@serenityjs/binarystream';
import { BasePacket, Packet, Serialize } from '../BasePacket';

@Packet(0x09)
class ConnectionRequest extends BasePacket {
	@Serialize(Long) public clientGuid!: bigint;
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectionRequest };
