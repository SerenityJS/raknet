import { Short, Long } from '@serenityjs/binarystream';
import { BasePacket, Packet, Serialize } from '../BasePacket';
import { ServerAddress, Address, SystemAddress } from '../types';

@Packet(0x10)
class ConnectionRequestAccepted extends BasePacket {
	@Serialize(Address) public clientAddress!: ServerAddress;
	@Serialize(Short) public systemIndex!: number;
	@Serialize(SystemAddress) public systemAddresses!: ServerAddress[];
	@Serialize(Long) public requestTimestamp!: bigint;
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectionRequestAccepted };
