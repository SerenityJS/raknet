# Raknet Protocol

## About

Raknet protocol contains all the basic Raknet native packets. It also contains some basic constants that are uses with the implemtation.

## Usage

```ts
import { UnconnectedPing } from '@serenityjs/raknet-protocol';

// Creates a new Ping packet
const ping = new UnconnectedPing();

ping.clientGuid = 123456789n;
ping.magic = Buffer.from('Magic!');
ping.timestamp = BigInt(Date.now());

// Serializes the packet into a buffer
const buffer = ping.serialize();
```
