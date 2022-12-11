const webpack = require('webpack')
const helpers = require('./helpers')
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

let config = {
  entry: {
    'main': helpers.root('/src/main.ts')
  },
  output: {
    path: helpers.root('/dist'),
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[name].[hash].js',
    publicPath: '/static'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.html', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      enforce: 'pre',
      loader: 'tslint-loader',
      // options: {
      //   configFile: 'tsconfig.client.json'
      // }
    },
    {
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    },
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: 'awesome-typescript-loader',
      // options: {
      //   configFile: 'tsconfig.client.json'
      // }
    },
    {
      test: /\.html$/,
      loader: 'raw-loader',
      exclude: ['./src/index.html']
    },
    { 
      test: /\.json$/, 
      loader: 'json-loader' 
    }
    ]
  },
  plugins: [
    new NamedModulesPlugin(),
    new CopyWebpackPlugin([{
      from: 'src/assets',
      to: './assets'
    }]),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
}

module.exports = config
