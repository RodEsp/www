const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
	entry: {
		index: './src/client/js/index.js'
	},
	output: {
		path: path.join(__dirname, 'dist/public/js'),
		filename: '[name].js'
	},
	target: 'web',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			}
		]
	},
	plugins: [
		new UglifyJsPlugin({
			cache: true,
			parallel: true,
			sourceMap: true // set to true if you want JS source maps
		}),
		new CopyPlugin([{ 
			from: 'src/client', 
			to: '../', 
			ignore: ['*.js'],
			transform(content/*, path*/) {
				return Promise.resolve(content);
			}
		}]),
	]
};