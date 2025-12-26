import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user';
import { SocialAuthService, SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GoogleSigninButtonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private authSubscription?: Subscription;

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Écouter les événements d'authentification Google
    this.authSubscription = this.socialAuthService.authState.subscribe({
      next: (user: SocialUser) => {
        if (user) {
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

  // Inscription avec formulaire classique
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerRequest: RegisterRequest = {
      username: this.registerForm.get('username')?.value.trim(),
      email: this.registerForm.get('email')?.value.trim().toLowerCase(),
      password: this.registerForm.get('password')?.value,
      confirmPassword: this.registerForm.get('password')?.value,
      role: 'READER'
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Account created successfully! Redirecting...';
        // La redirection est gérée automatiquement dans le service
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Inscription avec Google
  registerWithGoogle(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // La bibliothèque gère automatiquement le popup Google
    // L'événement authState sera déclenché si réussi
  }

  // Gérer la réponse Google
  private handleGoogleSignIn(user: SocialUser): void {
    if (!user.idToken) {
      this.errorMessage = 'Failed to get Google authentication token.';
      this.isLoading = false;
      return;
    }

    // Envoyer le token au backend avec le rôle READER
    this.authService.googleLogin(user.idToken, 'READER').subscribe({
      next: (response) => {
        this.successMessage = 'Google sign-in successful! Redirecting...';
        // La redirection est gérée automatiquement dans le service
      },
      error: (error) => {
        console.error('Google login error:', error);
        this.errorMessage = error.error?.message || 'Google sign-in failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
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
  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }
}
