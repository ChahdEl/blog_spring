package ma.blogguer.blog.dto;

import lombok.Data;
import java.util.List;

@Data
public class PostRequest {
    private String title;
    private String content;
    private String resume;
    private String category;
    private String image;
    private List<String> tags;
}
