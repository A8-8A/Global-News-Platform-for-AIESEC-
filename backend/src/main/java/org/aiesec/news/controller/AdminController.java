package org.aiesec.news.controller;

import org.aiesec.news.dto.AdminDtos.*;
import org.aiesec.news.security.CurrentUser;
import org.aiesec.news.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin moderation endpoints.
 *
 *   GET    /api/admin/posts/pending          the approval queue
 *   POST   /api/admin/posts/{id}/approve     approve a queued post
 *   POST   /api/admin/posts/{id}/reject      reject a queued post
 *   DELETE /api/admin/posts/{id}             delete a post
 *   DELETE /api/admin/comments/{id}          delete a comment
 *   GET    /api/admin/mcp-activity           per-MCP posting summary
 *   GET    /api/admin/audit-log              the audit trail
 *
 * Everything here sits under /api/admin/**, which SecurityConfig
 * restricts to ROLE_ADMIN - so a non-admin token cannot reach any of it.
 * The /pending, /approve and /reject paths match what the frontend's
 * AdminDashboard already calls.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // --- approval queue ---

    @GetMapping("/posts/pending")
    public List<PendingPostResponse> pendingPosts() {
        return adminService.getPendingPosts();
    }

    @PostMapping("/posts/{id}/approve")
    public void approve(@PathVariable Long id) {
        adminService.approvePost(CurrentUser.requireId(), id);
    }

    @PostMapping("/posts/{id}/reject")
    public void reject(@PathVariable Long id) {
        adminService.rejectPost(CurrentUser.requireId(), id);
    }

    // --- content removal ---

    @DeleteMapping("/posts/{id}")
    public void deletePost(@PathVariable Long id) {
        adminService.deletePost(CurrentUser.requireId(), id);
    }

    @DeleteMapping("/comments/{id}")
    public void deleteComment(@PathVariable Long id) {
        adminService.deleteComment(CurrentUser.requireId(), id);
    }

    // --- visibility ---

    @GetMapping("/posts/all")
    public List<PendingPostResponse> allPosts() {
        return adminService.getAllPosts();
    }

    @GetMapping("/mcp-activity")
    public List<McpActivityResponse> mcpActivity() {
        return adminService.getMcpActivity();
    }

    @GetMapping("/audit-log")
    public List<AdminActionResponse> auditLog() {
        return adminService.getAuditLog();
    }
}
