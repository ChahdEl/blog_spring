import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Récupérer le token
  const token = authService.getToken();

  // Cloner la requête et ajouter le header Authorization si le token existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Gérer les erreurs HTTP
  return next(authReq).pipe(
    catchError((error) => {
      // Si erreur 401 (Unauthorized)
      if (error.status === 401) {
        console.error('Authentication error:', error);

        // ✅ Ne déconnecter que si un token était présent
        // (évite la déconnexion lors du chargement initial sans token)
        if (token) {
          // Token invalide ou expiré, déconnecter l'utilisateur
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      }
      
      // Si erreur 403 (Forbidden) - permissions insuffisantes
      if (error.status === 403) {
        console.error('Permission denied:', error);
        // Ne pas déconnecter, juste afficher un message ou rediriger
      }

      return throwError(() => error);
    })
  );
};
