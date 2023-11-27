import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Long } from '../types';

@Packet(0x00)
class ConnectedPing extends BasePacket {
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectedPing };
