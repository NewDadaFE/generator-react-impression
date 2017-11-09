const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { merge, fn, resolve } = require('webpack-fn')

const { npm_package_name: NAME, npm_package_version: VERSION } = process.env

const PATHS = {
  package: resolve('./package.json'),
  entry: resolve('./src/main.js'),
  output: resolve('dist'),
  src: resolve('./src'),
  html: resolve('src/index.html'),
  css: resolve('src/app/styles'),
}

const common = merge([
  fn.output({
    path: PATHS.output,
    filename: 'scripts/app.js',
  }),
  fn.image({
    limit: 10000,
    name: 'images/[name].[hash:6].[ext]',
  }),
  fn.font({
    limit: 10000,
    name: 'fonts/[name].[ext]',
  }),
  fn.resolve(PATHS.src),
  fn.html(PATHS.html),
  fn.moment(),
])

const production = merge([
  fn.entry(PATHS.entry),
  fn.output({
    publicPath: `//fe.imdada.cn/${NAME}/${VERSION}/`,
  }),
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
  fn.stats(),
  fn.clean(PATHS.output),
  fn.env({
    'process.env.NODE_ENV': '"production"',
    __DEV__: JSON.stringify(false),
  }),
  fn.minifyJS(),
  {
    plugins: [new ExtractTextPlugin('styles/app.css')],
  },
])

const development = merge([
  fn.entry([
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    PATHS.entry,
  ]),
  fn.output({ publicPath: 'http://localhost:8080/' }),
  fn.eslint({
    exclude: /node_modules/,
    options: {
      failOnError: true,
    },
  }),
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
  fn.devtool('cheap-module-eval-source-map'),
  fn.devServer({
    proxy: require(PATHS.package).proxy || {},
  }),
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

module.exports = env =>
  env.production ? merge(common, production) : merge(common, development)
