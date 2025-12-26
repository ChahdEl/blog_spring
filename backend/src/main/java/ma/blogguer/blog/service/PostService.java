package ma.blogguer.blog.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ma.blogguer.blog.dto.AuthorDTO;
import ma.blogguer.blog.dto.PostRequest;
import ma.blogguer.blog.dto.PostResponse;
import ma.blogguer.blog.entity.Post;
import ma.blogguer.blog.entity.User;
import ma.blogguer.blog.repository.PostRepository;
import ma.blogguer.blog.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final Logger log = LoggerFactory.getLogger(PostService.class);
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeService likeService;

    @Transactional
    public PostResponse createPost(PostRequest request, String email) {
        User author = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .resume(request.getResume())
                .category(request.getCategory())
                .image(request.getImage())
                .tags(request.getTags())
                .author(author)
                .readTime(calculateReadTime(request.getContent()))
                .build();

        Post savedPost = postRepository.save(post);
        return toPostResponse(savedPost, email);
    }

    public List<PostResponse> getAllPosts() {
        return getAllPosts(null);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts(String userEmail) {
        log.info("🔍 getAllPosts appelé avec userEmail: {}", userEmail);
        try {
            List<Post> posts = postRepository.findByOrderByCreatedAtDesc();
            log.info("✅ {} posts trouvés dans la base de données", posts.size());
            
            List<PostResponse> responses = posts.stream()
                    .map(post -> {
                        try {
                            log.debug("📝 Conversion du post ID: {} - Titre: {}", post.getId(), post.getTitle());
                            return toPostResponse(post, userEmail);
                        } catch (Exception e) {
                            log.error("❌ ERREUR lors de la conversion du post ID: {} - {}", post.getId(), e.getMessage(), e);
                            throw e;
                        }
                    })
                    .collect(Collectors.toList());
            
            log.info("✅ {} posts convertis avec succès", responses.size());
            return responses;
        } catch (Exception e) {
            log.error("❌ ERREUR CRITIQUE dans getAllPosts: {}", e.getMessage(), e);
            throw e;
        }
    }

    public PostResponse getPostById(Long id) {
        return getPostById(id, null);
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id, String userEmail) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return toPostResponse(post, userEmail);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getMyPosts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return postRepository.findByAuthorId(user.getId())
                .stream()
                .map(post -> toPostResponse(post, email))
                .collect(Collectors.toList());
    }

    private int calculateReadTime(String content) {
        if (content == null || content.isEmpty())
            return 0;
        int wordCount = content.split("\\s+").length;
        return (int) Math.ceil(wordCount / 200.0); // 200 words per minute
    }

    // Conversion methods
    private PostResponse toPostResponse(Post post, String userEmail) {
        log.debug("🔄 toPostResponse - Post ID: {}, UserEmail: {}", post.getId(), userEmail);
        
        try {
            // ✅ Simplification : si pas d'email, pas de like possible
            boolean likedByCurrentUser = false;
            if (userEmail != null && !userEmail.isEmpty()) {
                try {
                    log.debug("💙 Vérification like pour post {} par user {}", post.getId(), userEmail);
                    likedByCurrentUser = likeService.hasUserLiked(post.getId(), userEmail);
                } catch (Exception e) {
                    log.warn("⚠️ Erreur lors de la vérification du like: {}", e.getMessage());
                    likedByCurrentUser = false;
                }
            }

            log.debug("👤 Récupération de l'auteur pour post {}", post.getId());
            User author = post.getAuthor();
            if (author == null) {
                log.warn("⚠️ Post {} n'a pas d'auteur!", post.getId());
            } else {
                log.debug("✅ Auteur trouvé: {} (ID: {})", author.getDisplayUsername(), author.getId());
            }

            log.debug("🏗️ Construction de PostResponse pour post {}", post.getId());
            return PostResponse.builder()
                    .id(post.getId())
                    .title(post.getTitle())
                    .content(post.getContent())
                    .excerpt(post.getResume()) // resume -> excerpt
                    .category(post.getCategory())
                    .image(post.getImage())
                    .readTime(post.getReadTime())
                    .likes(post.getLikes())
                    .comments(post.getCommentsCount()) // commentsCount -> comments
                    .likedByCurrentUser(likedByCurrentUser)
                    .tags(post.getTags())
                    .author(toAuthorDTO(post.getAuthor()))
                    .date(post.getCreatedAt()) // createdAt -> date
                    .updatedAt(post.getUpdatedAt())
                    .build();
        } catch (Exception e) {
            log.error("❌ ERREUR dans toPostResponse pour post {}: {}", post.getId(), e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la conversion du post " + post.getId(), e);
        }
    }

    private AuthorDTO toAuthorDTO(User user) {
        log.debug("👤 toAuthorDTO - User: {}", user != null ? user.getId() : "null");
        
        // ✅ Protection contre les auteurs null
        if (user == null) {
            log.warn("⚠️ Auteur null détecté, utilisation d'un auteur par défaut");
            return AuthorDTO.builder()
                    .id(0L)
                    .username("Utilisateur inconnu")
                    .email("")
                    .avatar(null)
                    .build();
        }
        
        try {
            log.debug("✅ Création AuthorDTO pour user {} - {}", user.getId(), user.getDisplayUsername());
            return AuthorDTO.builder()
                    .id(user.getId())
                    .username(user.getDisplayUsername()) // Utilise le vrai username
                    .email(user.getEmail())
                    .avatar(user.getAvatar())
                    .build();
        } catch (Exception e) {
            log.error("❌ ERREUR dans toAuthorDTO pour user {}: {}", user.getId(), e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la création de l'AuthorDTO", e);
        }
    }
}
