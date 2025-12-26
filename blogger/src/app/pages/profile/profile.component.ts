import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User, UpdateProfileRequest } from '../../models/user';
import { HeaderComponent } from '../../components/header/header';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    profileForm: FormGroup;
    currentUser: User | null = null;
    isLoading = false;
    successMessage = '';
    errorMessage = '';

    constructor() {
        this.profileForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: [{ value: '', disabled: true }], // Email non modifiable pour l'instant
            avatar: [''],
            bio: ['']
        });
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser) {
            this.profileForm.patchValue({
                username: this.currentUser.username,
                email: this.currentUser.email,
                avatar: this.currentUser.avatar || '',
                bio: this.currentUser.bio || ''
            });
        }
    }

    onSubmit(): void {
        if (this.profileForm.invalid) return;

        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';

        const request: UpdateProfileRequest = {
            username: this.profileForm.get('username')?.value,
            avatar: this.profileForm.get('avatar')?.value,
            bio: this.profileForm.get('bio')?.value
        };

        this.authService.updateProfile(request).subscribe({
            next: (response) => {
                this.successMessage = 'Profile updated successfully!';
                this.currentUser = response.user; // Mise à jour locale
                this.isLoading = false;
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                this.errorMessage = error.message || 'Failed to update profile';
                this.isLoading = false;
            }
        });
    }

    onViewChange(view: string): void {
        // Gérer les événements de navigation du header
        // La navigation est déjà gérée dans le HeaderComponent
    }

    onSearch(query: string): void {
        // La recherche n'est pas applicable sur la page de profil
    }
}
