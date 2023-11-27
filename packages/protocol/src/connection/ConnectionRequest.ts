import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Long } from '../types';

@Packet(0x09)
class ConnectionRequest extends BasePacket {
	@Serialize(Long) public clientGuid!: bigint;
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectionRequest };
