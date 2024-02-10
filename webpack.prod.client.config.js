import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

export default {
	entry: {
		index: './src/client/js/index.js',
	},
	mode: 'production',
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
		new TerserPlugin({
			parallel: true,
		}),
	],
	target: 'web',
};
