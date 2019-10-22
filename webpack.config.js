var nodeExternals = require('webpack-node-externals');
var path = require('path');

// Add to dependencies
// "@babel/core"
// "@babel/node"
// "@babel/preset-env"
// "babel-loader"
// module.rules = [{
	// test: /\.m?js$/,
	// exclude: /(node_modules)/,
	// use: {
	// 	loader: 'babel-loader',
	// 	options: {
	// 		presets: ['@babel/preset-env']
	// 	}
	// }
// }];

const nodeModules = nodeExternals();

const clientConfig = {
	entry: [
		'./src/client/js/index.js',
	],
	target: 'web',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'js/index.js'
	},
	externals: [nodeModules]
};

const serverConfig = {
	entry: [
		'./src/server/server.js',
	],
	target: 'node',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'server.js'
	},
	externals: [nodeModules]
};

module.exports = [clientConfig, serverConfig];