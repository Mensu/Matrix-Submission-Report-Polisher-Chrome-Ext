var webpack = require('webpack');
var path = require('path');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
module.exports = {
  entry: {
    "front": path.join(__dirname, 'js', 'front_entry.js'),
    "back": path.join(__dirname, 'js', 'back_entry.js')
  },
  output: {
    path: path.join(__dirname, 'js', 'outputs'),
    filename: 'polish_[name].js',
    chunkFilename: 'common-async-[id].js'
  },
  module: {
    // loaders: [
    //   {test: /\.css$/, loader: 'style!css'}
    // ]
  },
  plugins: [
    // new CommonsChunkPlugin({
    //     filename: "commons-sync.js",
    //     name: "commons",
    //     chunks: ['front', 'back']
    // })
  ]
}
