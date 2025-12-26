import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderLanding } from '../../components/header_landing/header_landing';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, HeaderLanding],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      // Si l'utilisateur est déjà connecté, on le redirige vers sa page d'accueil
      // On utilise une petite astuce pour récupérer l'utilisateur car redirectBasedOnRole est privé
      // Mais on peut utiliser les méthodes publiques
      if (this.authService.isBlogger()) {
        this.router.navigate(['/blogger']);
      } else if (this.authService.isReader()) {
        this.router.navigate(['/reader/home']);
      } else {
        // Fallback
        this.router.navigate(['/home']);
      }
    }
  }
  

  navigateToRegister(): void {
    // Par défaut on envoie vers register général ou un choix
    // Ici on envoie vers register pour commencer
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
