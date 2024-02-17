import type { Buffer } from 'node:buffer';
import type { Connection } from '../connection/index.js';

interface ServerEvents {
	connect: [Connection];
	disconnect: [Connection];
	encapsulated: [Connection, Buffer];
}

export type { ServerEvents };
