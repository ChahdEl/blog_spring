export interface LikeUser {
    userId: number;
    username: string;
    avatar: string;
    likedAt: Date;
}

export interface LikeResponse {
    liked: boolean;
    message: string;
}
