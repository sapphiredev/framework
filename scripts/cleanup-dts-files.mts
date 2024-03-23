import { findFilesRecursivelyRegex } from '@sapphire/node-utilities';
import { readFile, writeFile } from 'fs/promises';

const distFolder = new URL('../dist/', import.meta.url);

const allTypingsFiles = findFilesRecursivelyRegex(distFolder, /\.d\.[cm]?ts$/);
const srcTypeRegex = /src\./g;
const srcImportAllRegex = /import \* as src from 'src';/g;
const srcImportSideEffectRegex = /import 'src';/g;

for await (const file of allTypingsFiles) {
	const fileContent = await readFile(file, 'utf-8');

	const replacedContent = fileContent //
		.replace(srcTypeRegex, '')
		.replace(srcImportAllRegex, '')
		.replace(srcImportSideEffectRegex, '');

	await writeFile(file, replacedContent);
}
