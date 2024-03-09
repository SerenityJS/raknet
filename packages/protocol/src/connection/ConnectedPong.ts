import { Long } from '@serenityjs/binaryutils';
import { BasePacket, Packet, Serialize } from '../BasePacket.js';

@Packet(0x03)
class ConnectedPong extends BasePacket {
	@Serialize(Long) public pingTimestamp!: bigint;
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectedPong };
