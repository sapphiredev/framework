import { opendir, rm } from 'fs/promises';
import { join, sep } from 'path';
import { URL } from 'url';

async function* scan(path, cb) {
	const dir = await opendir(path);

	for await (const item of dir) {
		const file = join(dir.path, item.name);
		if (item.isFile()) {
			if (cb(file)) yield file;
		} else if (item.isDirectory()) {
			yield* scan(file, cb);
		}
	}
}

try {
	const folder = new URL('../dist', import.meta.url);
	const regexp = /(?:\.d\.ts(?:\.map)?|\.tsbuildinfo)$/;
	const cb = (path) => regexp.test(path);

	for await (const path of scan(folder, cb)) {
		if (!path.endsWith(`dist${sep}index.d.ts`)) {
			await rm(path);
		}
	}
} catch (err) {
	console.error(err);
}
