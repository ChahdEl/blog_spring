package ma.blogguer.blog.service;

import lombok.RequiredArgsConstructor;
import ma.blogguer.blog.dto.LikeResponse;
import ma.blogguer.blog.entity.Like;
import ma.blogguer.blog.entity.Post;
import ma.blogguer.blog.entity.User;
import ma.blogguer.blog.repository.LikeRepository;
import ma.blogguer.blog.repository.PostRepository;
import ma.blogguer.blog.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public boolean toggleLike(Long postId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if already liked
        if (likeRepository.existsByUserIdAndPostId(user.getId(), postId)) {
            // Unlike
            likeRepository.deleteByUserIdAndPostId(user.getId(), postId);

            // Update post likes count
            post.setLikes(Math.max(0, post.getLikes() - 1));
            postRepository.save(post);
            return false; // unliked
        } else {
            // Like
            Like like = Like.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(like);

            // Update post likes count
            post.setLikes(post.getLikes() + 1);
            postRepository.save(post);
            return true; // liked
        }
    }

    public List<LikeResponse> getLikesForPost(Long postId) {
        return likeRepository.findByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(this::toLikeResponse)
                .collect(Collectors.toList());
    }

    public boolean hasUserLiked(Long postId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElse(null);

        if (user == null) {
            return false;
        }

        return likeRepository.existsByUserIdAndPostId(user.getId(), postId);
    }

    private LikeResponse toLikeResponse(Like like) {
        return LikeResponse.builder()
                .userId(like.getUser().getId())
                .username(like.getUser().getDisplayUsername())
                .avatar(like.getUser().getAvatar())
                .likedAt(like.getCreatedAt())
                .build();
    }
}
