import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RegisterBlogguerComponent } from './pages/register-blogguer/register-blogguer.component';
import { HomeReaderComponent } from './pages/home-reader/home-reader.component';
import { authGuard } from '../auth.guard';
import { readerGuard, bloggerGuard } from '../role.guard';

export const routes: Routes = [
  // Redirection par défaut (si Home existait, mais pour l'instant je ne suis pas sûr s'il y a un HomeComponent.
  // D'après list_dir il y a un dossier `home`. Je vais supposer qu'il y a un composant.)
  // Je vais d'abord mettre login en defaut si pas authentifié, ou home.
  // Pour faire simple et suivre le plan:

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register_bogguer', component: RegisterBlogguerComponent },
  { path: 'home', component: HomeReaderComponent, canActivate: [authGuard] },
  {
    path: 'reader/home',
    canActivate: [readerGuard],
    loadComponent: () =>
      import('./pages/home-reader/home-reader.component').then((m) => m.HomeReaderComponent),
  },
  // Routes protégées pour BLOGGER
  {
    path: 'profile',
    canActivate: [bloggerGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'blogger',
    canActivate: [bloggerGuard],
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'blogger/post-form',
    canActivate: [bloggerGuard],
    loadComponent: () => import('./components/post-form/post-form').then((m) => m.PostForm),
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./pages/post-detail/post-detail').then((m) => m.PostDetail),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component').then((m) => m.LandingPageComponent),
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
