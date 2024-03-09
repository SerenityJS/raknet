import type { Buffer } from 'node:buffer';
import { Endianness, BinaryStream, Uint8 } from '@serenityjs/binaryutils';
import type { ValidTypes } from './ValidTypes.js';
import type { DataType } from './types/index.js';

// TODO: Document all this, and probably clean it up a bit.

interface PacketMetadata {
	endian: Endianness;
	name: string;
	testField?: string;
	type: ValidTypes;
}

abstract class BasePacket extends BinaryStream {
	public static ID: number;
	public static ID_TYPE: ValidTypes = Uint8;
	public serialized: Buffer | null = null;
	public deserialized: boolean = false;

	public constructor(buffer?: Buffer) {
		super(buffer);
	}

	public getId(): number {
		throw new Error('Packet.getId() is not implemented.');
	}

	public getIdType(): ValidTypes {
		throw new Error('Packet.getIdType() is not implemented.');
	}

	public serialize(): Buffer {
		throw new Error('Packet.serialize() is not implemented.');
	}

	public deserialize(): this {
		throw new Error('Packet.deserialize() is not implemented.');
	}
}

/**
 * **SetIdType**
 *
 * Sets the packet ID type of the base packet.
 *
 * @param {ValidTypes} type - The packet ID type.
 * @returns
 */
function SetIdType(type: ValidTypes) {
	return function (target: typeof BasePacket) {
		target.ID_TYPE = type;
	};
}

// TODO: Clean this up... a lot.
// Make readable lmao

function Packet(id: number) {
	return function (target: typeof BasePacket) {
		target.ID = id;
		const metadata: PacketMetadata[] = Reflect.getOwnMetadata('properties', target.prototype);
		const properties = Object.getOwnPropertyNames(target.prototype);
		if (!properties.includes('serialize'))
			target.prototype.serialize = function () {
				if (this.serialized) return this.serialized;

				target.ID_TYPE.write(this, target.ID as never);
				if (!metadata) return this.getBuffer();
				for (const { name, type, endian, testField } of metadata) {
					if (testField) {
						const value = (this as any)[testField!];
						(type as typeof DataType).write(this, (this as never)[name], endian, value);
					} else {
						type.write(this, (this as never)[name], endian);
					}
				}

				this.serialized = this.getBuffer();

				return this.serialized;
			};

		if (!properties.includes('deserialize'))
			target.prototype.deserialize = function () {
				if (this.deserialized) return this;

				target.ID_TYPE.read(this);
				if (!metadata) return this;
				for (const { name, type, endian, testField } of metadata) {
					if (testField) {
						const value = (this as any)[testField!];
						(this as any)[name] = (type as typeof DataType).read(this, endian, value);
					} else {
						(this as any)[name] = type.read(this, endian);
					}
				}

				this.deserialized = true;

				return this;
			};

		if (!properties.includes('getId'))
			target.prototype.getId = function () {
				return target.ID;
			};

		if (!properties.includes('getIdType'))
			target.prototype.getIdType = function () {
				return target.ID_TYPE;
			};
	};
}

function Serialize(type: ValidTypes, endian: Endianness = Endianness.Big, testField?: string) {
	if (!type) throw new Error('Type is required');

	return function (target: any, name: string) {
		const properties = Reflect.getOwnMetadata('properties', target) || [];
		properties.push({ name, type, endian, testField });
		Reflect.defineMetadata('properties', properties, target);
	};
}

export { BasePacket, SetIdType, Packet, Serialize };
