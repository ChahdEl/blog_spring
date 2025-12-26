import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CommentRequest } from '../models/comment';

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private apiUrl = 'http://localhost:8082/api';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token'); // ✅ Utiliser la même clé que AuthService
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }

    addComment(postId: number, content: string): Observable<Comment> {
        const request: CommentRequest = { content };
        return this.http.post<Comment>(
            `${this.apiUrl}/posts/${postId}/comments`,
            request,
            { headers: this.getHeaders() }
        );
    }

    getComments(postId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(
            `${this.apiUrl}/posts/${postId}/comments`,
            { headers: this.getHeaders() }
        );
    }

    deleteComment(commentId: number): Observable<void> {
        return this.http.delete<void>(
            `${this.apiUrl}/comments/${commentId}`,
            { headers: this.getHeaders() }
        );
    }
}
