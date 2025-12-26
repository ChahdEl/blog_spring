// guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../app/services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService) as AuthService;
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

export const bloggerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && ['BLOGGER', 'ADMIN'].includes(user.role.toUpperCase())) {
        return true;
      }

      if (!user) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      } else {
        router.navigate(['/home']);
      }
      return false;
    })
  );
};

export const readerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService) as AuthService;
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && user.role.toUpperCase() === 'READER') {
        return true;
      }

      if (!user) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
      } else {
        router.navigate(['/home']);
      }
      return false;
    })
  );
};
