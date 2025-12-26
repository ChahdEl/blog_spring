package ma.blogguer.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String excerpt; // Frontend attend "excerpt" au lieu de "resume"
    private String category;
    private String image;
    private int readTime;
    private int likes;
    private int comments; // Frontend attend "comments" au lieu de "commentsCount"
    private boolean likedByCurrentUser; // true si l'utilisateur connecté a liké
    private List<String> tags;

    // Info auteur sous forme d'objet
    private AuthorDTO author;

    // Frontend attend "date" au lieu de "createdAt"
    private LocalDateTime date;
    private LocalDateTime updatedAt;
}