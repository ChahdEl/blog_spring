package ma.blogguer.blog.service;

import lombok.extern.slf4j.Slf4j;
import ma.blogguer.blog.dto.OAuth2UserInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Slf4j
@Service
public class GoogleAuthService {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();
    private final tools.jackson.databind.ObjectMapper objectMapper = new ObjectMapper();

    public OAuth2UserInfo validateGoogleToken(String idToken) {
        try {
            // Appeler Google API pour valider le token
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

            String response = restTemplate.getForObject(url, String.class);
            Map<String, Object> claims = objectMapper.readValue(response, Map.class);

            // Vérifier l'audience (client ID)
            String audience = (String) claims.get("aud");
            if (!googleClientId.equals(audience)) {
                throw new RuntimeException("Token Google invalide");
            }

            return OAuth2UserInfo.builder()
                    .id((String) claims.get("sub"))
                    .email((String) claims.get("email"))
                    .name((String) claims.get("name"))
                    .givenName((String) claims.get("given_name"))
                    .familyName((String) claims.get("family_name"))
                    .picture((String) claims.get("picture"))
                    .provider("google")
                    .build();

        } catch (Exception e) {
            log.error("Erreur lors de la validation du token Google", e);
            throw new RuntimeException("Token Google invalide");
        }
    }
}