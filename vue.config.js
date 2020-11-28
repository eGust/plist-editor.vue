const { alias } = require('./config/webpackPathAlias');

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  configureWebpack: {
    resolve: { alias },
  },
};
