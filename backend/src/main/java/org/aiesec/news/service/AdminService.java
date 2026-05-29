package org.aiesec.news.service;

import org.aiesec.news.domain.*;
import org.aiesec.news.dto.AdminDtos.*;
import org.aiesec.news.exception.NotFoundException;
import org.aiesec.news.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    @Transactional(readOnly = true)
    public List<PendingPostResponse> getPendingPosts() {
        return postRepository
                .findByStatusOrderByCreatedAtAsc(PostStatus.PENDING).stream()
                .map(AdminService::toPendingResponse)
                .toList();
    }

    @Transactional
    public void approvePost(Long adminId, Long postId) {
        Post post = requirePost(postId);
        post.setStatus(PostStatus.APPROVED);
        postRepository.save(post);
        log(adminId, "APPROVE_POST", "POST", postId, "Approved post: " + post.getTitle());
    }

    @Transactional
    public void rejectPost(Long adminId, Long postId) {
        Post post = requirePost(postId);
        post.setStatus(PostStatus.REJECTED);
        postRepository.save(post);
        log(adminId, "REJECT_POST", "POST", postId, "Rejected post: " + post.getTitle());
    }

    @Transactional
    public void deletePost(Long adminId, Long postId) {
        Post post = requirePost(postId);
        String title = post.getTitle();
        postRepository.delete(post);
        log(adminId, "DELETE_POST", "POST", postId, "Deleted post: " + title);
    }

    @Transactional
    public void deleteComment(Long adminId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found."));
        commentRepository.delete(comment);
        log(adminId, "DELETE_COMMENT", "COMMENT", commentId, "Deleted a comment");
    }

    @Transactional(readOnly = true)
    public List<McpActivityResponse> getMcpActivity() {
        return userRepository.findByRole(Role.MCP).stream()
                .map(mcp -> new McpActivityResponse(
                        mcp.getId(),
                        mcp.getFullName(),
                        mcp.getOfficeName(),
                        mcp.getPhotoUrl(),
                        postRepository.countByAuthorId(mcp.getId()),
                        postRepository.countByAuthorIdAndStatus(mcp.getId(), PostStatus.APPROVED),
                        postRepository.countByAuthorIdAndStatus(mcp.getId(), PostStatus.PENDING),
                        postRepository.countByAuthorIdAndStatus(mcp.getId(), PostStatus.REJECTED)))
                .toList();
    }

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
        User author = p.getAuthor();
        return new PendingPostResponse(
                p.getId(),
                p.getTitle(),
                p.getContent(),
                p.getExcerpt(),
                p.getTag(),
                p.getMediaUrl(),
                author.getId(),
                author.getFullName(),
                author.getOfficeName(),
                author.getPhotoUrl(),
                p.getCreatedAt());
    }
}
