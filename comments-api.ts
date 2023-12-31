import express, { Request, Response } from 'express';
import { IComment, CommentCreatePayload } from "./types";
import { readFile, writeFile } from "fs/promises";
import { v4 as uuidv4, v4 } from 'uuid';

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

const validateComment = (comment: CommentCreatePayload): string | null => {
	switch (true) {
		case !comment:
		case JSON.stringify(comment) === '{}':
			return "Comment is absent or empty";
		case !comment.name:
			return "Field `name` is absent";
		case !comment.body:
			return "Field `body` is absent";
		case !comment.email:
			return "Field `email` is absent";
		case !comment.postId:
			return "Field `postId` is absent";
		default:
			return null;
	}
}

const compareValues = (target: string, compare: string): boolean => {
	return target.toLowerCase() === compare.toLowerCase();
}

export const checkCommentUniq = (payload: CommentCreatePayload, comments: IComment[]): boolean => {
	const byEmail = comments.find(({ email }) => compareValues(payload.email, email));

	if (!byEmail) {
		return true;
	}

	const { body, name, postId } = byEmail;
	return !(
		compareValues(payload.body, body) &&
		compareValues(payload.name, name) &&
		compareValues(payload.postId.toString(), postId.toString())
	);
}

const PATH = '/api/comments';

app.get(PATH, async (req: Request, res: Response) => {
	const comments = await loadComments();
	res.setHeader('Content-Type', 'application/json');
	res.send(comments);
});

app.post(PATH, async (req: Request<{}, {}, CommentCreatePayload>, res: Response) => {
	try {
		const validationResult = validateComment(req.body);

		if (validationResult) {
			res.status(400);
			res.send(validationResult);
			return;
		}

		const id = v4();
		// сохранить новый комментарий в файл

		const comments = await loadComments();

		const isUniq = checkCommentUniq(req.body, comments);

		if (!isUniq) {
			res.status(422);
			res.send("Comment with the same fields already exists");
			return;
		}

		comments.push({ ...req.body, id });
		await saveComments(comments);

		res.status(201);
		res.send(`Comment id:${id} has been added!`);
	} catch {
		res.status(500);
		res.send("Server error. Comment has not been created");
	}
});

// api/comments/:id
app.get(`${PATH}/:id`, async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	const comments = await loadComments();
	const comment = comments.find(comment => comment.id === id);
	if (!comment) {
		res.status(404);
		res.send(`Comment with id ${id} is not found`);
		return;
	}

	res.send(comment);
});

app.patch(PATH, async (
	req: Request<{}, {}, Partial<IComment>>,
	res: Response
) => {
	const comments = await loadComments();
	const newComment = req.body as CommentCreatePayload;
    const validationResult = validateComment(newComment);

    if (validationResult) {
        res.status(400);
        res.send(validationResult);
        return;
    }
    
    const id = uuidv4();
    const commentToCreate = { ...newComment, id };
    comments.push(commentToCreate);
    await saveComments(comments);
    
    res.status(201);
    res.send(commentToCreate);

	const targetCommentIndex = comments.findIndex(({ id }) => req.body.id === id);

	if (targetCommentIndex > -1) {
		comments[targetCommentIndex] = { ...comments[targetCommentIndex], ...req.body }
		await saveComments(comments);

		res.status(200);
		res.send(comments[targetCommentIndex]);
		return;
	}
});

app.delete(`${PATH}/:id`, async (req: Request<{ id: string }>, res: Response) => {
    const comments = await loadComments();
    const id = req.params.id;

    let removedComment: IComment | null = null;

    const filteredComments = comments.filter((comment) => {
        if (id === comment.id.toString()) {
            removedComment = comment;
            return false;
        }

        return true;
    });

    if (removedComment) {
        await saveComments(filteredComments);
        res.status(200);
        res.send(removedComment);
        return;
    }

    res.status(404);
    res.send(`Comment with id ${id} is not found`);
});

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});