import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackDevClientConfig from '../../webpack.dev.client.config';

const PORT = process.env.PORT || 8080;

const compiler = webpack(webpackDevClientConfig);
const app = express();

app.use(webpackDevMiddleware(compiler, {
	publicPath: webpackDevClientConfig.output.publicPath
}));

app.use(express.static('dist/public'));

app.get('/', (req, res, next) => {
	compiler.outputFileSystem.readFile(path.join(process.cwd(), 'index.html'), (err, result) => {
		console.log(path.join(process.cwd(), 'index.html'));
		if (err) {
			return next(err);
		}
		res.set('content-type', 'text/html');
		res.send(result);
		res.end();
	});
});

app.listen(PORT, () => {
	console.log(`App listening to ${PORT}....`);
});
