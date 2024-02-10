import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';

const app = express();

const PORT = 80;

app.use(express.static('public'));
// Use body-parser to handle form data
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

app.post('/send_email', async (req, res) => {
	const email_info = {
		name: req.body.name,
		email: req.body.email,
		subject: req.body.subject,
		text: req.body.message,
	};

	let response;
	try {
		response = await fetch(process.env.EMAIL_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(email_info),
		});
	} catch (e) {
		console.log('There was an error calling the ValTown API.');
		console.log(JSON.stringify(email_info, null, 2));
		console.log(e);
	}

	if (response !== undefined && !response.ok) {
		res.status(500);
		res.json({ ok: false });
	} else {
		res.status(200);
		res.json({ ok: true });
		console.log('Email successfully sent!');
	}
	console.log(JSON.stringify(email_info, null, 2));
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}....`);
});
