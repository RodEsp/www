import express from 'express';
import path from 'path';

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.static('dist/public'));

app.get('/', (req, res) => {
	res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.listen(PORT, () => {
	console.log(`App listening to ${PORT}....`);
});