import { Raknet } from './Raknet';

const raknet = new Raknet('127.0.0.1');

const started = raknet.start('Hello World!');

if (started) {
	console.log('Server started!');
}
