import { UserConfig } from 'vite';

import { alias } from './config/vitePathAlias';

const config: UserConfig = {
  assetsDir: 'assets',
  alias,
};

export default config;
