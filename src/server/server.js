import path from 'path';

import express from 'express';

const app = express();

const PORT = 80;

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}....`);
});