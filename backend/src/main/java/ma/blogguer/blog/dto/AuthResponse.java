package ma.blogguer.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private UserResponse user;

    public static AuthResponse error(String message) {
        return AuthResponse.builder()
                .message(message)
                .build();
    }

    public static AuthResponse success(String token, Long id, String username, String email, String role,
            String avatar) {
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.builder()
                        .id(id)
                        .username(username)
                        .email(email)
                        .role(role)
                        .avatar(avatar)
                        .build())
                .build();
    }
}