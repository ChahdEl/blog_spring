package ma.blogguer.blog.controller;

import lombok.RequiredArgsConstructor;
import ma.blogguer.blog.entity.User;
import ma.blogguer.blog.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private final UserRepository userRepository;

    /**
     * Endpoint pour mettre à jour les avatars manquants
     * Génère des avatars UI Avatars pour tous les utilisateurs qui n'en ont pas
     */
    @PostMapping("/update-missing-avatars")
    public ResponseEntity<String> updateMissingAvatars() {
        List<User> usersWithoutAvatar = userRepository.findAll().stream()
                .filter(user -> user.getAvatar() == null || user.getAvatar().isEmpty())
                .toList();

        int updated = 0;
        for (User user : usersWithoutAvatar) {
            String defaultAvatar = "https://ui-avatars.com/api/?name=" +
                    user.getUsername().replace(" ", "+") +
                    "&background=a855f7&color=fff&size=200";
            user.setAvatar(defaultAvatar);
            userRepository.save(user);
            updated++;
        }

        return ResponseEntity.ok("Updated " + updated + " users with missing avatars");
    }
}
