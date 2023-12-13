import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from './DataType';

interface ServerAddress {
	address: string;
	port: number;
	version: number;
}

class Address extends DataType {
	public static override read(stream: BinaryStream): ServerAddress {
		const version = stream.readUint8();
		if (version === 4) {
			const addressBuffer = stream.read(4);
			const address = addressBuffer.map((byte) => (-byte - 1) & 0xff).join('.');
			const port = stream.readUShort();

			return { address, port, version };
		} else {
			stream.skip(2);
			const port = stream.readUShort();
			stream.skip(16);
			const addressBuffer = stream.read(4);
			const address = addressBuffer.filter((byte) => byte !== 0xff).join('.');
			stream.skip(4);

			return { address, port, version };
		}
	}

	public static override write(stream: BinaryStream, value: ServerAddress): void {
		const { address, port, version } = value;
		stream.writeUint8(version);
		const addressBits = address.split('.', 4);
		for (const bit of addressBits) {
			stream.writeUint8(Number(bit));
		}

		stream.writeUShort(port);
	}
}

export { Address, type ServerAddress };
