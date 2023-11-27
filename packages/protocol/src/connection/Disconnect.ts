import { Packet, BasePacket } from '../BasePacket';

@Packet(0x15)
class Disconnect extends BasePacket {}

export { Disconnect };
