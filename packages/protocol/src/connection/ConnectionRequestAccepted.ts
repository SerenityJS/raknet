import { Short, Long } from '@serenityjs/binaryutils';
import { BasePacket, Packet, Serialize } from '../BasePacket.js';
import { ServerAddress, Address, SystemAddress } from '../types/index.js';

@Packet(0x10)
class ConnectionRequestAccepted extends BasePacket {
	@Serialize(Address) public clientAddress!: ServerAddress;
	@Serialize(Short) public systemIndex!: number;
	@Serialize(SystemAddress) public systemAddresses!: ServerAddress[];
	@Serialize(Long) public requestTimestamp!: bigint;
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectionRequestAccepted };
