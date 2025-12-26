import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Post, CreatePostRequest } from '../models/post';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'http://localhost:8082/api/posts';
  private postsSubject = new BehaviorSubject<Post[]>([]);
  public posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) {
    // ✅ Ne pas charger automatiquement les posts au démarrage
    // Les composants appelleront loadPosts() quand nécessaire
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // ✅ Utiliser la même clé que AuthService
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }
  // ancien
  // loadPosts(): void {
  //     console.log('🔄 Chargement des posts depuis:', this.apiUrl);
  //     console.log('🔑 Token utilisé:', localStorage.getItem('auth_token') ? 'Présent' : 'Absent');

  //     this.http.get<Post[]>(this.apiUrl, { headers: this.getHeaders() })
  //         .subscribe({
  //             next: (posts) => {
  //                 console.log('✅ Posts reçus du backend:', posts);
  //                 console.log('📊 Nombre de posts:', posts.length);
  //                 this.postsSubject.next(posts);
  //             },
  //             error: (err) => {
  //                 console.error('❌ Erreur chargement posts:', err);
  //                 console.error('📋 Détails erreur:', {
  //                     status: err.status,
  //                     statusText: err.statusText,
  //                     message: err.message,
  //                     error: err.error
  //                 });
  //             }
  //         });
  // }

  loadPosts(): void {
    console.log('🔄 Chargement des posts...');

    this.http.get<Post[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (posts) => {
        console.log('✅ Posts chargés:', posts.length);
        this.postsSubject.next(posts);
      },
      error: (err) => {
        console.error('❌ Erreur chargement posts:', err);
      },
    });
  }

  addPost(postData: CreatePostRequest): Observable<Post> {
    const postRequest = {
      title: postData.title,
      content: postData.content,
      resume: postData.excerpt, // Backend attend "resume"
      category: postData.category,
      image: postData.image,
      tags: postData.tags || [],
    };

    return this.http
      .post<Post>(this.apiUrl, postRequest, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((newPost) => {
          const currentPosts = this.postsSubject.value;
          this.postsSubject.next([newPost, ...currentPosts]);
        })
      );
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getMyPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/my-posts`, {
      headers: this.getHeaders(),
    });
  }

  likePost(id: number): void {
    // TODO: Implement like functionality with backend
    console.log('Like post:', id);
  }
}
