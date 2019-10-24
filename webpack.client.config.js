const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

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
		new CopyPlugin([
			{ from: 'src/client', to: '../', ignore: ['*.js'] }
		]),
	]
};