import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

import webpackDevClientConfig from '../../webpack.dev.client.config';

const PORT = 8080;

const compiler = webpack(webpackDevClientConfig);
const app = express();

app.use(webpackDevMiddleware(compiler, {
	publicPath: webpackDevClientConfig.output.publicPath,
	writeToDisk: true
}));

app.use(express.static('dist/public'));

app.listen(PORT, () => {
	console.log('Dev Server Started');
	console.log(`Server is running on port ${PORT}....`);
});
