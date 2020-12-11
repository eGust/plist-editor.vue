import { UserConfig } from 'vite';
import svgPlugin from 'vite-plugin-svg';

import { alias } from './config/vitePathAlias';

const config: UserConfig = {
  assetsDir: 'assets',
  alias,
  plugins: [
    svgPlugin(),
  ],
};

export default config;
