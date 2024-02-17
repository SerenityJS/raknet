import { Packet, BasePacket } from '../BasePacket.js';

@Packet(0x15)
class Disconnect extends BasePacket {}

export { Disconnect };
