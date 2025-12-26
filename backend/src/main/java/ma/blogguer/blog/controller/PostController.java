package ma.blogguer.blog.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ma.blogguer.blog.dto.PostRequest;
import ma.blogguer.blog.dto.PostResponse;
import ma.blogguer.blog.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private static final Logger log = LoggerFactory.getLogger(PostController.class);
    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @RequestBody PostRequest request,
            Authentication authentication) {
        // Cette méthode nécessite une authentification
        String email = authentication.getName();
        PostResponse post = postService.createPost(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(Authentication authentication) {
        log.info("📥 GET /api/posts - Authentication: {}", authentication != null ? "Présent" : "Absent");
        
        try {
            // Cette méthode devrait accepter les requêtes non authentifiées
            // authentication peut être null pour les utilisateurs non connectés
            String email = authentication != null ? authentication.getName() : null;
            log.info("👤 Email utilisateur: {}", email != null ? email : "Anonyme");
            
            List<PostResponse> posts = postService.getAllPosts(email);
            log.info("✅ Retour de {} posts", posts.size());
            
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            log.error("❌ ERREUR dans getAllPosts endpoint: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable Long id,
            Authentication authentication) {
        // Cette méthode devrait accepter les requêtes non authentifiées
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(postService.getPostById(id, email));
    }

    @GetMapping("/my-posts")
    public ResponseEntity<List<PostResponse>> getMyPosts(Authentication authentication) {
        // Cette méthode nécessite une authentification
        String email = authentication.getName();
        return ResponseEntity.ok(postService.getMyPosts(email));
    }
}