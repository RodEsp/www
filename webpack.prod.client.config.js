const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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
		filename: '[name].js'
	},
	plugins: [
		new CopyPlugin([{ 
			from: 'src/client', 
			to: '../', 
			ignore: ['*.js']
		}]),
		new UglifyJsPlugin({
			cache: true,
			parallel: true,
			sourceMap: true // set to true if you want JS source maps
		})
	],
	target: 'web'
};