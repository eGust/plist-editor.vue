const { readFileSync } = require('fs');

const basePath = __dirname.replace(/\/\w+$/, '');

const tsconfigJson = readFileSync(`${basePath}/tsconfig.json`, { encoding: 'utf-8' });

const tsconfigPaths = JSON.parse(tsconfigJson).compilerOptions.paths;

const pathAliases = Object.fromEntries(
  Object.entries(tsconfigPaths)
    .map(([a, [p]]) => [
      a.replace(/\/\*$/, ''),
      p.replace(/\/\*$/g, ''),
    ]),
);

const alias = Object.fromEntries(
  Object.entries(pathAliases)
    .map(([a, p]) => [
      a,
      `${basePath}/${p}`,
    ]),
);

module.exports = {
  tsconfigPaths,
  pathAliases,
  alias,
};
