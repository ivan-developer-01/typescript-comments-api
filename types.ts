export interface IComment {
	id: string;
	name: string;
	email: string;
	body: string;
	postId: number;
}

export type CommentCreatePayload = Omit<IComment, "id">;