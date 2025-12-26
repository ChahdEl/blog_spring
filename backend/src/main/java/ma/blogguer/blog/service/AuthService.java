package ma.blogguer.blog.service;

import lombok.RequiredArgsConstructor;
import ma.blogguer.blog.dto.*;
import ma.blogguer.blog.entity.User;
import ma.blogguer.blog.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleAuthService googleAuthService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // ... (rest of register method unchanged)
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.error("Cet email est déjà utilisé");
        }

        // Vérifier si le username existe déjà
        if (userRepository.existsByUsername(request.getUsername())) {
            return AuthResponse.error("Ce nom d'utilisateur est déjà utilisé");
        }

        // Vérifier la confirmation du mot de passe
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            return AuthResponse.error("Les mots de passe ne correspondent pas");
        }

        System.out.println("DEBUG REGISTER: Received Role=" + request.getRole());
        System.out.println("DEBUG REGISTER: Received Username=" + request.getUsername());

        // Générer un avatar par défaut basé sur le username
        String defaultAvatar = "https://ui-avatars.com/api/?name=" +
                request.getUsername().replace(" ", "+") +
                "&background=random&color=fff&size=200";

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.valueOf(request.getRole() != null ? request.getRole() : "READER"))
                .avatar(defaultAvatar) // Ajouter l'avatar par défaut
                .enabled(true)
                .build();

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.success(
                jwtToken,
                user.getId(),
                user.getDisplayUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getAvatar());
    }

    public AuthResponse authenticate(AuthRequest request) {
        // ... (authenticate method unchanged)
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            var user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (!user.isEnabled()) {
                return AuthResponse.error("Le compte est désactivé");
            }

            var jwtToken = jwtService.generateToken(user);
            return AuthResponse.success(
                    jwtToken,
                    user.getId(),
                    user.getDisplayUsername(),
                    user.getEmail(),
                    user.getRole().name(),
                    user.getAvatar());
        } catch (Exception e) {
            return AuthResponse.error("Email ou mot de passe incorrect");
        }
    }

    public AuthResponse authenticateWithGoogle(String idToken, String role) {
        try {
            // 1. Valider le token avec le vrai service
            OAuth2UserInfo userInfo = googleAuthService.validateGoogleToken(idToken);

            // 2. Vérifier ou créer l'utilisateur
            var user = userRepository.findByEmail(userInfo.getEmail())
                    .orElseGet(() -> {
                        // Déterminer le rôle
                        User.Role userRole = User.Role.READER; // Défaut
                        if (role != null && !role.isEmpty()) {
                            try {
                                userRole = User.Role.valueOf(role);
                            } catch (IllegalArgumentException e) {
                                // Rôle invalide, garder défaut
                            }
                        }

                        // Créer nouvel utilisateur
                        var newUser = User.builder()
                                .username(userInfo.getEmail().split("@")[0]) // Fallback username
                                .email(userInfo.getEmail())
                                .provider("GOOGLE")
                                .providerId(userInfo.getId())
                                .role(userRole)
                                .enabled(true)
                                .avatar(userInfo.getPicture())
                                .password(passwordEncoder.encode("GOOGLE_AUTH_NO_PASSWORD")) // Mot de passe dummy
                                .build();
                        return userRepository.save(newUser);
                    });

            // 3. Générer token JWT
            var jwtToken = jwtService.generateToken(user);
            return AuthResponse.success(
                    jwtToken,
                    user.getId(),
                    user.getDisplayUsername(),
                    user.getEmail(),
                    user.getRole().name(),
                    user.getAvatar());

        } catch (Exception e) {
            e.printStackTrace();
            return AuthResponse.error("Erreur d'authentification Google: " + e.getMessage());
        }
    }

    // Méthode pour mettre à jour le profil
    public AuthResponse updateProfile(UpdateProfileRequest request, String token) {
        String userEmail = jwtService.extractUsername(token);
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            // Vérifier unicité si changé
            if (!user.getUsername().equals(request.getUsername())
                    && userRepository.existsByUsername(request.getUsername())) {
                return AuthResponse.error("Ce nom d'utilisateur est déjà pris");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        userRepository.save(user);

        // Regénérer token avec nouvelles infos (optionnel, mais bon pour la cohérence)
        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.success(
                jwtToken,
                user.getId(),
                user.getDisplayUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getAvatar());
    }

    // Méthode pour récupérer le profil utilisateur

    // Méthode pour récupérer le profil utilisateur
    public UserProfile getCurrentUser(String token) {
        String userEmail = jwtService.extractUsername(token);
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return UserProfile.fromUser(user);
    }

    // Méthode pour valider un token
    public boolean validateToken(String token) {
        try {
            String userEmail = jwtService.extractUsername(token);
            var user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            return jwtService.isTokenValid(token, user);
        } catch (Exception e) {
            return false;
        }
    }
}