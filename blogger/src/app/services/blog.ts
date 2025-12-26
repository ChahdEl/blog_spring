import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post, Comment } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private posts: Post[] = [];
  private postsSubject = new BehaviorSubject<Post[]>(this.posts);
  public posts$ = this.postsSubject.asObservable();

  constructor() { }

  getPosts(): Observable<Post[]> {
    return this.posts$;
  }

  getPostById(id: number): Post | undefined {
    return this.posts.find(post => post.id === id);
  }

  addPost(post: Post): void {
    post.id = Math.max(...this.posts.map(p => p.id)) + 1;
    post.date = new Date();
    this.posts.unshift(post);
    this.postsSubject.next(this.posts);
  }

  updatePost(post: Post): void {
    const index = this.posts.findIndex(p => p.id === post.id);
    if (index !== -1) {
      this.posts[index] = post;
      this.postsSubject.next(this.posts);
    }
  }

  deletePost(id: number): void {
    this.posts = this.posts.filter(post => post.id !== id);
    this.postsSubject.next(this.posts);
  }

  likePost(id: number): void {
    const post = this.posts.find(p => p.id === id);
    if (post) {
      post.likes++;
      this.postsSubject.next(this.posts);
    }
  }

  searchPosts(query: string): Post[] {
    return this.posts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  getPostsByCategory(category: string): Post[] {
    if (category === 'Tous') return this.posts;
    return this.posts.filter(post => post.category === category);
  }
}