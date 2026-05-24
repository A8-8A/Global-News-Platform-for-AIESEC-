package org.aiesec.news.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Audit-trail entry. The spec requires every admin action to be logged.
 * Written whenever an admin approves/rejects a post, deletes content, etc.
 */
@Entity
@Table(name = "admin_actions")
@Getter
@Setter
@NoArgsConstructor
public class AdminAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    /** e.g. "APPROVE_POST", "REJECT_POST", "DELETE_COMMENT". */
    @Column(nullable = false, length = 32)
    private String action;

    /** e.g. "POST", "COMMENT". */
    @Column(name = "target_type", nullable = false, length = 32)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(columnDefinition = "text")
    private String detail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public static AdminAction of(User admin, String action,
                                 String targetType, Long targetId, String detail) {
        AdminAction a = new AdminAction();
        a.admin = admin;
        a.action = action;
        a.targetType = targetType;
        a.targetId = targetId;
        a.detail = detail;
        return a;
    }
}
