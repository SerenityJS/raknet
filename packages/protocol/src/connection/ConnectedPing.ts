import { Long } from '@serenityjs/binaryutils';
import { BasePacket, Packet, Serialize } from '../BasePacket.js';

@Packet(0x00)
class ConnectedPing extends BasePacket {
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectedPing };
