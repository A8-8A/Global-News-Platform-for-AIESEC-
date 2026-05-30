package org.aiesec.news.controller;

import jakarta.validation.Valid;
import org.aiesec.news.dto.PostDtos.*;
import org.aiesec.news.security.CurrentUser;
import org.aiesec.news.service.PostService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Authenticated post + engagement endpoints.
 *
 *   POST /api/posts                    create a post   (MCP only)
 *   GET  /api/posts/mine               my own posts    (MCP - any status)
 *   POST /api/posts/{id}/like          like / unlike   (any AIESEC user)
 *   POST /api/posts/{id}/comments      add a comment    (any AIESEC user)
 *
 * All require a valid session (SecurityConfig: anyRequest authenticated).
 * Role rules beyond "logged in" are enforced in the service layer -
 * e.g. only MCPs may create posts.
 */
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /** Create a post. Response status is APPROVED or PENDING. */
    @PostMapping
    public CreatePostResponse create(@Valid @RequestBody CreatePostRequest request) {
        return postService.createPost(CurrentUser.requireId(), request);
    }

    /** An MCP's own posts, including PENDING ones awaiting approval. */
    @GetMapping("/mine")
    public List<PostResponse> myPosts() {
        return postService.getMyPosts(CurrentUser.requireId());
    }

    /** Toggle a like on a post. */
    @PostMapping("/{id}/like")
    public LikeResponse like(@PathVariable Long id) {
        return postService.toggleLike(id, CurrentUser.requireId());
    }

    /** Delete own post — only the author may do this. */
    @DeleteMapping("/{id}")
    public void deleteOwnPost(@PathVariable Long id) {
        postService.deleteOwnPost(id, CurrentUser.requireId());
    }

    /** Comment on a post. */
    @PostMapping("/{id}/comments")
    public CommentResponse comment(@PathVariable Long id,
                                   @Valid @RequestBody CreateCommentRequest request) {
        return postService.addComment(id, CurrentUser.requireId(), request);
    }
}
