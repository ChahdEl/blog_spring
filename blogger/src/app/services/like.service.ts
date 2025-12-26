import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LikeUser, LikeResponse } from '../models/like';

@Injectable({
    providedIn: 'root'
})
export class LikeService {
    private apiUrl = 'http://localhost:8082/api/posts';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token'); // ✅ Utiliser la même clé que AuthService
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }

    toggleLike(postId: number): Observable<LikeResponse> {
        return this.http.post<LikeResponse>(
            `${this.apiUrl}/${postId}/like`,
            {},
            { headers: this.getHeaders() }
        );
    }

    getLikes(postId: number): Observable<LikeUser[]> {
        return this.http.get<LikeUser[]>(
            `${this.apiUrl}/${postId}/likes`,
            { headers: this.getHeaders() }
        );
    }

    hasLiked(postId: number): Observable<{ liked: boolean }> {
        return this.http.get<{ liked: boolean }>(
            `${this.apiUrl}/${postId}/liked`,
            { headers: this.getHeaders() }
        );
    }
}
