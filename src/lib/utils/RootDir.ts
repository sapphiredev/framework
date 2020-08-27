import { readFileSync } from 'fs';
import { dirname, join } from 'path';

function getProcessMainModule(): string | undefined {
	return (Reflect.get(process, 'mainModule') as NodeJS.Module | undefined)?.path;
}

function getRequireMain(): string | undefined {
	return require.main?.path;
}

function getPackageMain(): string | undefined {
	const cwd = process.cwd();

	try {
		const file = readFileSync(join(cwd, 'package.json'), 'utf8');
		return dirname(join(cwd, JSON.parse(file).main));
	} catch {
		return undefined;
	}
}

function getProcessCwd(): string {
	return process.cwd();
}

let path: string | null = null;
export function getRootDirectory(): string {
	if (path === null) path = getProcessMainModule() ?? getRequireMain() ?? getPackageMain() ?? getProcessCwd();
	return path;
}
