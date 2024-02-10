import path from 'path';
import nodeExternals from 'webpack-node-externals';

export default (env, argv) => {
	const SERVER_PATH =
    argv.mode === 'production'
    	? './src/server/server.js'
    	: './src/server/server.dev.js';

	return {
		entry: {
			server: SERVER_PATH,
		},
		output: {
			path: path.resolve(path.dirname(''), 'dist'),
			publicPath: '/',
			filename: 'server.cjs',
		},
		target: 'node',
		node: {
			// Need this when working with express, otherwise the build fails
			__dirname: false,
			__filename: false,
		},
		externals: [nodeExternals()], // Need this to avoid error when working with Express
		module: {
			rules: [
				{
					exclude: /node_modules/,
				},
			],
		},
	};
};
