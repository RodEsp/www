var nodeExternals = require('webpack-node-externals');
var path = require('path');

const nodeModules = nodeExternals();

const clientConfig = {
	entry: [
		'./src/client/js/index.js',
	],
	target: 'web',
	devtool: 'source-map',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'js/index.js'
	},
	externals: [nodeModules]
};

const serverConfig = {
	entry: {
		server: './src/server/server.js',
	},
	target: 'node',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'server.js'
	},
	externals: [nodeModules], // Need this to avoid error when working with Express
	module: {
		rules: [{
			// Transpiles ES6-8 into ES5
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader'
			}
		}]
	}
};

module.exports = [clientConfig, serverConfig];