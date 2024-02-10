import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

export default {
	devtool: 'source-map',
	entry: {
		index: './src/client/js/index.js',
	},
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
			},
		],
	},
	output: {
		path: path.join(process.cwd(), 'dist/public/js'),
		publicPath: '/',
		filename: '[name].js',
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: 'src/client',
					to: '../',
					globOptions: { ignore: ['**/*.js'] },
				},
			],
		}),
	],
	target: 'web',
};
