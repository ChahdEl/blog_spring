package ma.blogguer.blog.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthorDTO {
    private Long id;
    private String username; // Le vrai username, pas l'email
    private String email;
    private String avatar;
}
