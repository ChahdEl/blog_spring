package ma.blogguer.blog.controller;

import lombok.RequiredArgsConstructor;
import ma.blogguer.blog.dto.CommentRequest;
import ma.blogguer.blog.dto.CommentResponse;
import ma.blogguer.blog.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        CommentResponse comment = commentService.addComment(postId, request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long postId,
            Authentication authentication) {
        System.out.println("📥 GET /api/posts/" + postId + "/comments - Authentication: " + (authentication != null ? "Présent" : "Absent"));
        String email = authentication != null ? authentication.getName() : null;
        List<CommentResponse> comments = commentService.getCommentsForPost(postId, email);
        System.out.println("📤 Retour de " + comments.size() + " commentaires");
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {
        String email = authentication.getName();
        commentService.deleteComment(commentId, email);
        return ResponseEntity.noContent().build();
    }
}
