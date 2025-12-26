import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './app/services/auth.service';

// Guard pour les routes BLOGGER
export const bloggerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    // Pas connecté, rediriger vers login
    router.navigate(['/login']);
    return false;
  }

  if (authService.isBlogger()) {
    // Est un blogger, autoriser l'accès
    return true;
  } else {
    // Est un reader, rediriger vers reader/home
    router.navigate(['/reader/home']);
    return false;
  }
};

// Guard pour les routes READER
export const readerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    // Pas connecté, rediriger vers login
    router.navigate(['/login']);
    return false;
  }

  if (authService.isReader()) {
    // Est un reader, autoriser l'accès
    return true;
  } else {
    // Est un blogger, rediriger vers blogger
    router.navigate(['/blogger']);
    return false;
  }
};

// Guard général pour vérifier l'authentification
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
