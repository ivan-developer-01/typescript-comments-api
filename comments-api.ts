import express, { Request, Response } from 'express';
import { IComment } from "./types";
import { readFile, writeFile } from "fs/promises";

const app = express();

const jsonMiddleware = express.json();
app.use(jsonMiddleware);

const loadComments = async (): Promise<IComment[]> => {
	const rawData = await readFile("mock-comments.json", "binary");
	return JSON.parse(rawData.toString());
}

const saveComments = async (data: IComment[]): Promise<void> => {
    await writeFile("mock-comments.json", JSON.stringify(data));
}

const validateComment = (comment: IComment): string | null => {
	console.log(comment)
	// if (comment.name && comment.body && comment.email && comment.id && comment.postId) {
	// 	return "OK";
	// } else {
	// 	return "Very Bad request" + 
	// 			"Request was: " + JSON.stringify(comment);
	// }
	switch (true) {
		case !comment.name:
			return "Name is required";
		case !comment.body:
			return "Body is required";
		case !comment.email:
			return "Email is required";
		case !comment.id:
			return "Id is required";
		case !comment.postId:
			return "PostId is required";
		default:
			return null;
	}
}

const PATH = '/api/comments';

app.get(PATH, async (req: Request, res: Response) => {
	const comments = await loadComments();
	res.setHeader('Content-Type', 'application/json');
	res.send(comments);
});

app.post(PATH, async (req: Request<{}, {}, IComment>, res: Response) => {
    const validationResult = validateComment(req.body);

    if (validationResult) {
        res.status(400);
        res.send(validationResult);
        return;
    }


    const { id } = req.body;
    // сохранить новый комментарий в файл

    const comments = await loadComments();
    comments.push(req.body);
    await saveComments(comments);
    
    res.status(201);
    res.send(`Comment id:${id} has been added!`);
});

/* const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
	if (req.url === '/api/comments' && req.method === 'GET') {
		const comments = await loadComments();


		res.setHeader('Content-Type', 'application/json');
		res.write(JSON.stringify(comments));
		res.end();
	} else if (req.url === '/api/comments' && req.method === 'POST') {
		let rawBody = '';
		req.on('data', (chunk) => {
			rawBody += chunk.toString();
		});


		req.on('end', () => {
			console.log(JSON.parse(rawBody));
			res.end("OK")
		});
	} else {
		res.statusCode = 404;
		res.end('Not found');
	}
}); */


const PORT = 3000;


app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});