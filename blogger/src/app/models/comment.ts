export interface Comment {
    id: number;
    content: string;
    author: {
        id: number;
        username: string;
        avatar: string;
        email: string;
    };
    createdAt: Date;
    canDelete: boolean;
}

export interface CommentRequest {
    content: string;
}
