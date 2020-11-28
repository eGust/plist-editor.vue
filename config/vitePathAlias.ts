import { readFileSync } from 'fs';

const basePath = __dirname.replace(/\/\w+$/, '');

const tsconfigJson = readFileSync(`${basePath}/tsconfig.json`, { encoding: 'utf-8' });

export const tsconfigPaths = JSON.parse(tsconfigJson).compilerOptions.paths as Record<string, string[]>;

export const pathAliases = Object.fromEntries(
  Object.entries(tsconfigPaths)
    .map(([a, [p]]) => [
      a.replace(/\/\*$/, ''),
      p.replace(/\/\*$/, ''),
    ]),
);

export const alias = Object.fromEntries(
  Object.entries(pathAliases)
    .map(([a, p]) => [
      `${a}/`,
      `${basePath}/${p}/`,
    ]),
);
