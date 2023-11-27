import { BasePacket, Packet, Serialize } from '../BasePacket';
import { ServerAddress, Address } from '../types';

@Packet(0x13)
class NewIncomingConnection extends BasePacket {
	@Serialize(Address) public serverAddress!: ServerAddress;
	@Serialize(Address) public internalAddress!: ServerAddress;
}

export { NewIncomingConnection };
