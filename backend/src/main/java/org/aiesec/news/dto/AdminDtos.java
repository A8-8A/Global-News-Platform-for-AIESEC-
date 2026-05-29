package org.aiesec.news.dto;

import java.time.Instant;

/**
 * Response payloads for admin endpoints.
 */
public final class AdminDtos {

    private AdminDtos() {
    }

    /**
     * A post in the approval queue. Carries enough for the admin to
     * judge it: content, author identity (including id + photo for the
     * avatar), and when it was submitted.
     */
    public record PendingPostResponse(
            Long id,
            String title,
            String content,
            String excerpt,
            String tag,
            String mediaUrl,
            Long authorId,
            String authorName,
            String authorOffice,
            String authorPhotoUrl,
            Instant createdAt
    ) {
    }

    /** One row of the admin audit log. */
    public record AdminActionResponse(
            Long id,
            String adminName,
            String action,
            String targetType,
            Long targetId,
            String detail,
            Instant createdAt
    ) {
    }

    /**
     * A summary of an MCP's posting activity, for the "view MCP posting
     * activity" admin capability.
     */
    public record McpActivityResponse(
            Long mcpId,
            String mcpName,
            String office,
            String photoUrl,
            long totalPosts,
            long approvedPosts,
            long pendingPosts,
            long rejectedPosts
    ) {
    }
}
