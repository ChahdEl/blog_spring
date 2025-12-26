import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user';
import { SocialAuthService, SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private authSubscription?: Subscription;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Écouter les événements d'authentification Google
    this.authSubscription = this.socialAuthService.authState.subscribe({
      next: (user: SocialUser) => {
        if (user) {
          console.log('Google user received:', user);
          this.handleGoogleSignIn(user);
        }
      },
      error: (error) => {
        console.error('Google auth error:', error);
        this.errorMessage = 'Google authentication failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Connexion avec formulaire classique
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const loginRequest: LoginRequest = {
      email: this.loginForm.get('email')?.value.trim().toLowerCase(),
      password: this.loginForm.get('password')?.value,
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Login successful! Redirecting...';
        console.log('Login response:', response);

        // Rediriger selon le rôle de l'utilisateur
        setTimeout(() => {
          this.redirectByRole(response.user?.role);
        }, 1000);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Gérer la connexion Google
  private handleGoogleSignIn(user: SocialUser): void {
    if (!user.idToken) {
      this.errorMessage = 'Failed to get Google authentication token.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Sending Google token to backend...');

    // Google login sans spécifier de rôle (le backend détermine le rôle existant)
    // Si l'utilisateur n'existe pas, on peut définir un rôle par défaut (READER)
    this.authService.googleLogin(user.idToken, 'READER').subscribe({
      next: (response) => {
        console.log('Google login successful:', response);
        this.successMessage = 'Google sign-in successful! Redirecting...';

        // Rediriger selon le rôle de l'utilisateur
        setTimeout(() => {
          this.redirectByRole(response.user?.role);
        }, 1000);
      },
      error: (error) => {
        console.error('Google login error:', error);
        this.errorMessage = error.error?.message || 'Google sign-in failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Rediriger l'utilisateur selon son rôle
  private redirectByRole(role?: string): void {
    if (role === 'BLOGGER') {
      this.router.navigate(['/blogger']);
    } else if (role === 'READER') {
      this.router.navigate(['/reader/home']);
    } else {
      // Par défaut, rediriger vers reader-home
      this.router.navigate(['/reader/home']);
    }
    this.isLoading = false;
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
