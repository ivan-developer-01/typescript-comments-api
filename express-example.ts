import express, { Request, Response } from 'express';

const app = express();

app.get('/api/example', (req: Request, res: Response) => {
	res.send('Express.js server');
});

app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
