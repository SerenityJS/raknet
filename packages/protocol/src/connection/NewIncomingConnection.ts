import { BasePacket, Packet, Serialize } from '../BasePacket.js';
import { ServerAddress, Address } from '../types/index.js';

@Packet(0x13)
class NewIncomingConnection extends BasePacket {
	@Serialize(Address) public serverAddress!: ServerAddress;
	@Serialize(Address) public internalAddress!: ServerAddress;
}

export { NewIncomingConnection };
