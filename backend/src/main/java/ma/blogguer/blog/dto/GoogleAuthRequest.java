package ma.blogguer.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GoogleAuthRequest {
    private String idToken;
    private String role; // "BLOGGER" ou "READER"
}