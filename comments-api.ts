import { createServer, IncomingMessage, ServerResponse } from 'http';

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
	if (req.url === '/api/comments' && req.method === 'GET') {
		res.setHeader('Content-Type', 'application/json');
		res.write('abc');
		res.end();
	} else {
		res.statusCode = 404;
		res.end('Not found');
	}
});

const PORT = 3000;

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});