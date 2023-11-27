import { BasePacket, Packet, Serialize } from '../BasePacket';
import { Long } from '../types';

@Packet(0x03)
class ConnectedPong extends BasePacket {
	@Serialize(Long) public pingTimestamp!: bigint;
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectedPong };
