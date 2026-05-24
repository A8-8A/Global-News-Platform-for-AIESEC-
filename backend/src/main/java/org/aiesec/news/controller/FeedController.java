package org.aiesec.news.controller;

import org.aiesec.news.dto.PostDtos.PostDetailResponse;
import org.aiesec.news.dto.PostDtos.PostResponse;
import org.aiesec.news.security.OptionalCurrentUser;
import org.aiesec.news.service.PostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public feed endpoints.
 *
 *   GET /api/feed            approved posts, newest first
 *   GET /api/feed/{id}       a single post with its comments
 *
 * These are public (SecurityConfig permits GET /api/feed/**). If a
 * valid token IS present, the viewer id is used to fill in
 * {@code likedByMe}; if not, that field is simply false.
 */
@RestController
@RequestMapping("/api/feed")
public class FeedController {

    private final PostService postService;

    public FeedController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<PostResponse> feed() {
        return postService.getFeed(OptionalCurrentUser.idOrNull());
    }

    @GetMapping("/{id}")
    public PostDetailResponse post(@PathVariable Long id) {
        return postService.getPostDetail(id, OptionalCurrentUser.idOrNull());
    }
}
