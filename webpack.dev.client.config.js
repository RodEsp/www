const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	devtool: 'source-map',
	entry: {
		index: './src/client/js/index.js'
	},
	mode: 'development',
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
		new CopyPlugin({
			patterns: [{
				from: 'src/client',
				to: '../',
				globOptions: { ignore: ['**/*.js'] }
			}]
		}),
	],
	target: 'web'
};