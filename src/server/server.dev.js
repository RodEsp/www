import express from 'express';
import path from 'path';
import webpack from 'webpack';
import webpackDevClientConfig from '../../webpack.dev.client.config';
import webpackDevMiddleware from 'webpack-dev-middleware';

const PORT = process.env.PORT || 8080;

const compiler = webpack(webpackDevClientConfig);
const app = express();

app.use(webpackDevMiddleware(compiler, {
	publicPath: webpackDevClientConfig.output.publicPath,
	writeToDisk: true
}));

app.use(express.static('dist/public'));

app.get('/', (req, res, next) => {
	compiler.outputFileSystem.readFile(path.join(process.cwd(), 'index.html'), (err, result) => {
		if (err) {
			return next(err);
		}
		res.set('content-type', 'text/html');
		res.send(result);
		res.end();
	});
});

app.listen(PORT, () => {
	console.log('Dev Server Started');
	console.log(`App listening to ${PORT}....`);
});
