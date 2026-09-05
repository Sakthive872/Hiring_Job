package com.company.app.service;

import com.company.app.dto.feed.CommentDto;
import com.company.app.dto.feed.PostCreateDto;
import com.company.app.dto.feed.PostResponse;
import com.company.app.exception.BusinessRuleException;
import com.company.app.exception.DuplicateResourceException;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.model.Comment;
import com.company.app.model.Post;
import com.company.app.model.PostLike;
import com.company.app.model.User;
import com.company.app.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final PostRepository postRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public PostResponse createPost(PostCreateDto request) {
        User author = userService.getCurrentUser();
        Post post = Post.builder()
                .author(author)
                .content(request.content())
                .build();
        return map(postRepository.save(post));
    }

    public Page<PostResponse> getFeed(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::map);
    }

    @Transactional
    public PostResponse likePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userService.getCurrentUser();
        boolean alreadyLiked = post.getLikes().stream().anyMatch(like -> like.getUser().getId().equals(user.getId()));
        if (alreadyLiked) {
            throw new DuplicateResourceException("You already liked this post");
        }
        post.getLikes().add(PostLike.builder().post(post).user(user).build());
        notificationService.createNotification(post.getAuthor(), user, "POST_LIKE", user.getUsername() + " liked your post", "POST", post.getId());
        return map(postRepository.save(post));
    }

    @Transactional
    public PostResponse addComment(Long postId, CommentDto request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User author = userService.getCurrentUser();
        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .content(request.content())
                .build();
        post.getComments().add(comment);
        notificationService.createNotification(post.getAuthor(), author, "POST_COMMENT", author.getUsername() + " commented on your post", "POST", post.getId());
        return map(postRepository.save(post));
    }

    private PostResponse map(Post post) {
        List<CommentDto> comments = new ArrayList<>();
        if (post.getComments() != null) {
            post.getComments().forEach(comment -> comments.add(new CommentDto(comment.getContent())));
        }
        return new PostResponse(
                post.getId(),
                post.getAuthor() != null ? post.getAuthor().getId() : null,
                post.getAuthor() != null ? post.getAuthor().getUsername() : null,
                post.getContent(),
                post.getLikes() == null ? 0 : post.getLikes().size(),
                post.getComments() == null ? 0 : post.getComments().size(),
                comments,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
