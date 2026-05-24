package org.aiesec.news.service;

import org.aiesec.news.domain.*;
import org.aiesec.news.dto.AdminDtos.*;
import org.aiesec.news.exception.NotFoundException;
import org.aiesec.news.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Admin moderation logic.
 *
 * Capabilities (from the spec):
 *  - view the approval queue (posts that exceeded an MCP's weekly limit)
 *  - approve a queued post  -> it becomes visible in the feed
 *  - reject a queued post   -> implementation decision: we mark it
 *    REJECTED (kept, visible to its author) rather than hard-deleting,
 *    so the MCP can see what happened.
 *  - delete a post or a comment (remove inappropriate content)
 *  - view an MCP's posting activity
 *  - view the audit log
 *
 * EVERY state-changing action writes an AdminAction row. The spec
 * requires all admin actions to be logged; doing it here (not in the
 * controller) means the log can never be bypassed.
 */
@Service
public class AdminService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final AdminActionRepository adminActionRepository;

    public AdminService(PostRepository postRepository,
                        CommentRepository commentRepository,
                        UserRepository userRepository,
                        AdminActionRepository adminActionRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.adminActionRepository = adminActionRepository;
    }

    // ----------------------------------------------------------------
    // Approval queue
    // ----------------------------------------------------------------

    /** Posts awaiting a decision - oldest first (fairest to review). */
    @Transactional(readOnly = true)
    public List<PendingPostResponse> getPendingPosts() {
        return postRepository
                .findByStatusOrderByCreatedAtAsc(PostStatus.PENDING).stream()
                .map(AdminService::toPendingResponse)
                .toList();
    }

    /** Approve a queued post: it becomes APPROVED and enters the feed. */
    @Transactional
    public void approvePost(Long adminId, Long postId) {
        Post post = requirePost(postId);
        post.setStatus(PostStatus.APPROVED);
        postRepository.save(post);
        log(adminId, "APPROVE_POST", "POST", postId,
                "Approved post: " + post.getTitle());
    }

    /**
     * Reject a queued post. We mark it REJECTED rather than deleting it,
     * so the authoring MCP can still see the outcome (it shows in their
     * /api/posts/mine list, never in the public feed).
     */
    @Transactional
    public void rejectPost(Long adminId, Long postId) {
        Post post = requirePost(postId);
        post.setStatus(PostStatus.REJECTED);
        postRepository.save(post);
        log(adminId, "REJECT_POST", "POST", postId,
                "Rejected post: " + post.getTitle());
    }

    // ----------------------------------------------------------------
    // Content removal
    // ----------------------------------------------------------------

    /** Delete a post outright (comments + likes cascade in the DB). */
    @Transactional
    public void deletePost(Long adminId, Long postId) {
        Post post = requirePost(postId);
        String title = post.getTitle();
        postRepository.delete(post);
        log(adminId, "DELETE_POST", "POST", postId, "Deleted post: " + title);
    }

    /** Delete an inappropriate comment. */
    @Transactional
    public void deleteComment(Long adminId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found."));
        commentRepository.delete(comment);
        log(adminId, "DELETE_COMMENT", "COMMENT", commentId,
                "Deleted a comment");
    }

    // ----------------------------------------------------------------
    // Visibility: MCP activity + audit log
    // ----------------------------------------------------------------

    /** Posting-activity summary for every MCP. */
    @Transactional(readOnly = true)
    public List<McpActivityResponse> getMcpActivity() {
        return userRepository.findByRole(Role.MCP).stream()
                .map(mcp -> new McpActivityResponse(
                        mcp.getId(),
                        mcp.getFullName(),
                        mcp.getOfficeName(),
                        postRepository.countByAuthorId(mcp.getId()),
                        postRepository.countByAuthorIdAndStatus(mcp.getId(), PostStatus.APPROVED),
                        postRepository.countByAuthorIdAndStatus(mcp.getId(), PostStatus.PENDING),
                        postRepository.countByAuthorIdAndStatus(mcp.getId(), PostStatus.REJECTED)))
                .toList();
    }

    /** The full audit trail, newest first. */
    @Transactional(readOnly = true)
    public List<AdminActionResponse> getAuditLog() {
        return adminActionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(a -> new AdminActionResponse(
                        a.getId(),
                        a.getAdmin().getEmail(),
                        a.getAction(),
                        a.getTargetType(),
                        a.getTargetId(),
                        a.getDetail(),
                        a.getCreatedAt()))
                .toList();
    }

    // ----------------------------------------------------------------
    // internals
    // ----------------------------------------------------------------

    /** Write one audit-log row. Called by every state-changing action. */
    private void log(Long adminId, String action, String targetType,
                     Long targetId, String detail) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Admin not found."));
        adminActionRepository.save(
                AdminAction.of(admin, action, targetType, targetId, detail));
    }

    private Post requirePost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Post not found."));
    }

    private static PendingPostResponse toPendingResponse(Post p) {
        return new PendingPostResponse(
                p.getId(),
                p.getTitle(),
                p.getContent(),
                p.getMediaUrl(),
                p.getAuthor().getFullName(),
                p.getAuthor().getOfficeName(),
                p.getCreatedAt());
    }
}
