const cracoAlias = require('craco-alias');
const FontPreloadPlugin = require('webpack-font-preload-plugin');

module.exports = {
  plugins: [
    {
      plugin: cracoAlias,
      options: {
        source: 'tsconfig',
        tsConfigPath: 'tsconfig.paths.json',
      },
    },
  ],
  webpack: {
    plugins: {
      add: [
        new FontPreloadPlugin({
          extensions: ['woff2'],
        }),
      ],
    },
  },
};
