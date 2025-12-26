// src/components/header/header.ts
import { Component, EventEmitter, HostListener, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {
  @Output() searchQuery = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<string>();
  @Output() signupWithRole = new EventEmitter<string>();
  @Output() logoutEvent = new EventEmitter<void>();

  searchText = '';
  isMenuOpen = false;
  showSignupDropdown = false;

  private authService = inject(AuthService);
  private router = inject(Router);


  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  get isBlogger() {
    return this.authService.isBlogger();
  }

  onSearch(): void {
    this.searchQuery.emit(this.searchText);
  }


  changeView(view: string): void {
    this.viewChange.emit(view);
    this.isMenuOpen = false;

    // Navigation vers les pages d'authentification
    if (view === 'login') {
      this.router.navigate(['/login']);
    } else if (view === 'reader' || view === 'register' || view === 'signup') {
      this.router.navigate(['/register']);
    } else if (view === 'blogguer') {
      this.router.navigate(['/register_bogguer']);
    } else if (view === 'create') {
      this.router.navigate(['/blogger/post-form']);
    } else if (view === 'profile') {
      this.router.navigate(['/profile']);
    } else if (view === 'home') {
      this.router.navigate(['/']); // Assuming home is root
    }

  }



  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }


}
