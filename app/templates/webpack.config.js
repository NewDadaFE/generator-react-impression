const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { merge, fn, resolve } = require('webpack-fn')

const PATHS = {
  package: resolve('./package.json'),
  entry: resolve('./src/main.js'),
  output: resolve('dist'),
  src: resolve('./src'),
  html: resolve('src/index.html'),
  css: resolve('src/app/styles'),
}

const common = merge([fn.output(), fn.resolve(), fn.html(), fn.moment()])

const development = merge([
  fn.entry([
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    PATHS.entry,
  ]),
  fn.eslint(),
  fn.babel({
    include: [PATHS.src, /whatwg-fetch/],
    options: {
      cacheDirectory: true,
    },
  }),
  fn.sass({
    exclude: [PATHS.css, /node_modules/],
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          localIdentName: '[name]__[local]___[hash:base64:5]',
        },
      },
      'postcss-loader',
      'sass-loader',
    ],
  }),
  fn.sass({
    include: [PATHS.css, /node_modules/],
    use: [
      'style-loader',
      'css-loader?sourceMap',
      'postcss-loader?sourceMap',
      'sass-loader?sourceMap',
    ],
  }),
  fn.image(),
  fn.font(),
  fn.devtool(),
  fn.devServer(),
  fn.env({
    __DEV__: JSON.stringify(true),
  }),
  {
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
    ],
  },
])

const production = merge([
  fn.entry(PATHS.entry),
  fn.babel({
    include: [PATHS.src, /whatwg-fetch/],
  }),
  fn.sass({
    exclude: [PATHS.css, /node_modules/],
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[name]__[local]___[hash:base64:5]',
          },
        },
        'postcss-loader',
        'sass-loader',
      ],
    }),
  }),
  fn.sass({
    include: [PATHS.css, /node_modules/],
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: ['css-loader', 'postcss-loader', 'sass-loader'],
    }),
  }),
  fn.image('production'),
  fn.font('production'),
  fn.stats(),
  fn.clean(),
  fn.env({
    'process.env.NODE_ENV': '"production"',
    __DEV__: JSON.stringify(false),
  }),
  fn.minifyJS(),
  {
    plugins: [new ExtractTextPlugin('styles/app.css')],
  },
])

module.exports = env =>
  env.development ? merge(common, development) : merge(common, production)
