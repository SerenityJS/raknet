import { Long } from '@serenityjs/binarystream';
import { BasePacket, Packet, Serialize } from '../BasePacket';

@Packet(0x00)
class ConnectedPing extends BasePacket {
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectedPing };
