package ma.blogguer.blog.service;

import lombok.RequiredArgsConstructor;
import ma.blogguer.blog.dto.AuthorDTO;
import ma.blogguer.blog.dto.CommentRequest;
import ma.blogguer.blog.dto.CommentResponse;
import ma.blogguer.blog.entity.Comment;
import ma.blogguer.blog.entity.Post;
import ma.blogguer.blog.entity.User;
import ma.blogguer.blog.repository.CommentRepository;
import ma.blogguer.blog.repository.PostRepository;
import ma.blogguer.blog.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

        private final CommentRepository commentRepository;
        private final PostRepository postRepository;
        private final UserRepository userRepository;

        @Transactional
        public CommentResponse addComment(Long postId, CommentRequest request, String userEmail) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new RuntimeException("Post not found"));

                Comment comment = Comment.builder()
                                .post(post)
                                .user(user)
                                .content(request.getContent())
                                .build();

                Comment savedComment = commentRepository.save(comment);

                // Update post comments count
                post.setCommentsCount(post.getCommentsCount() + 1);
                postRepository.save(post);

                return toCommentResponse(savedComment, userEmail);
        }

        @Transactional(readOnly = true)
        public List<CommentResponse> getCommentsForPost(Long postId, String userEmail) {
                System.out.println("🔍 getCommentsForPost appelé - postId: " + postId + ", userEmail: " + userEmail);
                
                try {
                        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
                        System.out.println("✅ " + comments.size() + " commentaires trouvés dans la base de données");
                        
                        List<CommentResponse> responses = comments.stream()
                                        .map(comment -> {
                                                System.out.println("📝 Conversion du commentaire ID: " + comment.getId());
                                                return toCommentResponse(comment, userEmail);
                                        })
                                        .collect(Collectors.toList());
                        
                        System.out.println("✅ " + responses.size() + " commentaires convertis avec succès");
                        return responses;
                } catch (Exception e) {
                        System.err.println("❌ ERREUR dans getCommentsForPost: " + e.getMessage());
                        e.printStackTrace();
                        throw e;
                }
        }

        @Transactional
        public void deleteComment(Long commentId, String userEmail) {
                Comment comment = commentRepository.findById(commentId)
                                .orElseThrow(() -> new RuntimeException("Comment not found"));

                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Check if user owns the comment
                if (!comment.getUser().getId().equals(user.getId())) {
                        throw new RuntimeException("You can only delete your own comments");
                }

                // Update post comments count
                Post post = comment.getPost();
                post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
                postRepository.save(post);

                commentRepository.delete(comment);
        }

        private CommentResponse toCommentResponse(Comment comment, String currentUserEmail) {
                boolean canDelete = currentUserEmail != null && comment.getUser().getEmail().equals(currentUserEmail);

                return CommentResponse.builder()
                                .id(comment.getId())
                                .content(comment.getContent())
                                .author(toAuthorDTO(comment.getUser()))
                                .createdAt(comment.getCreatedAt())
                                .canDelete(canDelete)
                                .build();
        }

        private AuthorDTO toAuthorDTO(User user) {
                return AuthorDTO.builder()
                                .id(user.getId())
                                .username(user.getDisplayUsername())
                                .email(user.getEmail())
                                .avatar(user.getAvatar())
                                .build();
        }
}
