const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: {
		index: './src/client/js/index.js'
	},
	output: {
		path: path.join(__dirname, 'dist/public/js'),
		publicPath: '/',
		filename: '[name].js'
	},
	target: 'web',
	mode: 'development',
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
		new CopyPlugin([{
			from: 'src/client',
			to: '../',
			ignore: ['*.js']
		}]),
	]
};