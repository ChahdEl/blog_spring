package ma.blogguer.blog.controller;

import lombok.RequiredArgsConstructor;
import ma.blogguer.blog.dto.LikeResponse;
import ma.blogguer.blog.service.LikeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{postId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long postId,
            Authentication authentication) {
        String email = authentication.getName();
        boolean liked = likeService.toggleLike(postId, email);

        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("message", liked ? "Post liked" : "Post unliked");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/likes")
    public ResponseEntity<List<LikeResponse>> getLikes(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.getLikesForPost(postId));
    }

    @GetMapping("/{postId}/liked")
    public ResponseEntity<Map<String, Boolean>> hasLiked(
            @PathVariable Long postId,
            Authentication authentication) {
        String email = authentication.getName();
        boolean liked = likeService.hasUserLiked(postId, email);

        Map<String, Boolean> response = new HashMap<>();
        response.put("liked", liked);

        return ResponseEntity.ok(response);
    }
}
