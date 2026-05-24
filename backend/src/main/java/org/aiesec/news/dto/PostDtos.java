package org.aiesec.news.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/**
 * Request/response payloads for posts, the feed, comments and likes.
 */
public final class PostDtos {

    private PostDtos() {
    }

    // --- requests ---

    /** POST /api/posts - create a post (MCP only). */
    public record CreatePostRequest(
            @NotBlank(message = "Title is required")
            @Size(max = 255, message = "Title is too long")
            String title,

            @NotBlank(message = "Content is required")
            String content,

            @Size(max = 1024, message = "Media URL is too long")
            String mediaUrl
    ) {
    }

    /** POST /api/posts/{id}/comments - add a comment. */
    public record CreateCommentRequest(
            @NotBlank(message = "Comment cannot be empty")
            String content
    ) {
    }

    // --- responses ---

    /**
     * A post as shown in the feed. Carries author identity, engagement
     * counts, and - when the request is authenticated - whether the
     * current user has liked it.
     */
    public record PostResponse(
            Long id,
            String title,
            String content,
            String mediaUrl,
            String status,
            String authorName,
            String authorOffice,
            long likeCount,
            long commentCount,
            boolean likedByMe,
            Instant createdAt
    ) {
    }

    /** Result of creating a post - the frontend branches on status. */
    public record CreatePostResponse(
            Long id,
            String status
    ) {
    }

    /** A comment under a post. */
    public record CommentResponse(
            Long id,
            String content,
            String authorName,
            Instant createdAt
    ) {
    }

    /** Like/unlike result. */
    public record LikeResponse(
            boolean liked,
            long likeCount
    ) {
    }

    /** A post detail view: the post plus its comments. */
    public record PostDetailResponse(
            PostResponse post,
            List<CommentResponse> comments
    ) {
    }
}
