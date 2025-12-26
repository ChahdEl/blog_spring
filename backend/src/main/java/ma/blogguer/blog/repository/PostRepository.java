package ma.blogguer.blog.repository;

import ma.blogguer.blog.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByOrderByCreatedAtDesc();

    List<Post> findByAuthorId(Long userId);

    List<Post> findByTitle(String title);

    List<Post> findByCategory(String category);
}
