import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './app/services/auth.service';
import { map, take } from 'rxjs/operators';

// Guard général d'authentification
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};

// Guard pour les blogueurs uniquement
export const bloggerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      // Vérifier si l'utilisateur existe et est blogueur
      if (user && user.role === 'BLOGGER') {
        return true;
      }

      // Si pas d'utilisateur, rediriger vers login
      if (!user) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      } else {
        // Si utilisateur existe mais n'est pas blogueur, rediriger vers home
        router.navigate(['/home']);
      }
      return false;
    })
  );
};

// Guard pour les lecteurs uniquement
export const readerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      // Vérifier si l'utilisateur existe et est lecteur
      if (user && user.role === 'READER') {
        return true;
      }

      // Si pas d'utilisateur, rediriger vers login
      if (!user) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      } else {
        // Si utilisateur existe mais n'est pas lecteur, rediriger vers blogger
        router.navigate(['/blogger']);
      }
      return false;
    })
  );
};

// Guard pour empêcher l'accès aux pages d'inscription si déjà connecté
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }

      // Si déjà connecté, rediriger selon le rôle
      const user = authService.getCurrentUser();
      if (user?.role === 'BLOGGER') {
        router.navigate(['/blogger']);
      } else {
        router.navigate(['/home']);
      }
      return false;
    })
  );
};
