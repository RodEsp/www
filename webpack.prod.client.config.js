const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	entry: {
		index: './src/client/js/index.js'
	},
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			}
		]
	},
	output: {
		path: path.join(process.cwd(), 'dist/public/js'),
		publicPath: '/',
		filename: '[name].js'
	},
	plugins: [
		new CopyPlugin([{ 
			from: 'src/client', 
			to: '../', 
			ignore: ['*.js']
		}]),
		new TerserPlugin({
			cache: true,
			parallel: true
		})
	],
	target: 'web'
};