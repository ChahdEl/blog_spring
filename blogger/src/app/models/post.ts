
export interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  date: Date;
  avatar?: string;
}
// src/app/models/post.ts

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  author: PostAuthor;
  authorAvatar?: string;
  date: Date;
  likes: number;
  comments: number;
  tags: string[];
  readTime?: number;
  likedByCurrentUser?: boolean; // Indique si l'utilisateur connecté a liké
}

export interface PostAuthor {
  id: number;
  username: string; // C'est le nom que vous voulez afficher
  avatar?: string;
  email: string;
}

// ✅ Interface pour créer un post
export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  tags?: string[];
}