package ma.blogguer.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private AuthorDTO author;
    private LocalDateTime createdAt;
    private boolean canDelete; // true si c'est le commentaire de l'utilisateur connecté
}
