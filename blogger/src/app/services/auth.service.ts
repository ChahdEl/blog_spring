import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  User,
  GoogleAuthRequest,
  UpdateProfileRequest
} from '../models/user';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  private isBrowser: boolean;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Observables publics
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Initialiser les sujets seulement côté client
    if (this.isBrowser) {
      this.isAuthenticatedSubject.next(this.hasToken());
      this.currentUserSubject.next(this.getStoredUser());
    }
  }

  // ✅ CORRECTION: Inscription classique avec stockage et redirection
  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        tap((response) => {
          if (response.token) {
            this.handleRegistration(response);
          }
        }),
        catchError((error) => {
          console.error('Erreur lors de l\'inscription:', error);
          throw error;
        })
      );
  }

  // Gérer l'inscription : stockage + redirection
  private handleRegistration(response: AuthResponse): void {
    this.storeAuthData(response);
    this.redirectBasedOnRole(response.user);
  }

  // ✅ CORRECTION: Connexion classique (avec redirection)
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap((response) => {
          if (response.token) {
            this.handleAuthentication(response);
          }
        }),
        catchError((error) => {
          console.error('Erreur lors de la connexion:', error);
          throw error;
        })
      );
  }

  // ✅ CORRECTION: Connexion avec Google (avec redirection)
  googleLogin(idToken: string, role: 'BLOGGER' | 'READER' = 'READER'): Observable<AuthResponse> {
    const googleAuthRequest: GoogleAuthRequest = { idToken, role };
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/google`, googleAuthRequest)
      .pipe(
        tap((response) => {
          if (response.token) {
            this.handleAuthentication(response);
          }
        }),
        catchError((error) => {
          console.error('Erreur lors de la connexion Google:', error);
          throw error;
        })
      );

  }

  // Mettre à jour le profil utilisateur
  updateProfile(request: UpdateProfileRequest): Observable<AuthResponse> {
    return this.http
      .put<AuthResponse>(`${this.apiUrl}/profile`, request, {
        headers: { Authorization: `Bearer ${this.getToken()}` }
      })
      .pipe(
        tap((response) => {
          if (response.user) {
            // Mettre à jour l'utilisateur stocké
            this.handleAuthentication(response);
          }
        }),
        catchError((error) => {
          console.error('Erreur lors de la mise à jour du profil:', error);
          throw error;
        })
      );
  }

  // Stocker les données d'authentification
  private storeAuthData(response: AuthResponse): void {
    this.setItem(this.tokenKey, response.token);
    if (response.user) {
      this.setItem(this.userKey, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    }
    this.isAuthenticatedSubject.next(true);
  }

  // Rediriger selon le rôle
  private redirectBasedOnRole(user: User | undefined): void {
    if (!user) {
      this.router.navigate(['/']);
      return;
    }
    switch (user.role) {
      case 'BLOGGER':
        this.router.navigate(['/blogger']);
        break;
      case 'READER':
        this.router.navigate(['/reader/home']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  // Gérer l'authentification (connexion)
  private handleAuthentication(response: AuthResponse): void {
    this.storeAuthData(response);
    this.redirectBasedOnRole(response.user);
  }

  // Récupérer l'utilisateur courant
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  // Vérifier si l'utilisateur est blogueur
  isBlogger(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'BLOGGER';
  }

  // Vérifier si l'utilisateur est lecteur
  isReader(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'READER';
  }

  // Récupérer le token
  getToken(): string | null {
    return this.getItem(this.tokenKey);
  }

  // Récupérer le rôle
  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user?.role || null;
  }

  // Déconnexion
  logout(): void {
    this.removeItem(this.tokenKey);
    this.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Vérifier si un token existe
  private hasToken(): boolean {
    return !!this.getItem(this.tokenKey);
  }

  // Récupérer l'utilisateur stocké
  private getStoredUser(): User | null {
    const userStr = this.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Méthodes sécurisées pour localStorage
  private getItem(key: string): string | null {
    if (this.isBrowser && localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setItem(key: string, value: string): void {
    if (this.isBrowser && localStorage) {
      localStorage.setItem(key, value);
    }
  }

  private removeItem(key: string): void {
    if (this.isBrowser && localStorage) {
      localStorage.removeItem(key);
    }
  }
}
