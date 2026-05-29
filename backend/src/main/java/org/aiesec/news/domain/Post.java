package org.aiesec.news.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A news post. Created only by MCPs (enforced in the service layer).
 * {@link #status} controls whether it appears in the public feed.
 *
 * V2 adds: excerpt (standfirst) and tag (editorial category).
 * These require V2 Flyway migration columns.
 */
@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The MCP who wrote the post. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    /** Short standfirst shown on the feed card. Optional. */
    @Column(length = 512)
    private String excerpt;

    /** Editorial tag e.g. CONGRESS, GROWTH. Optional. */
    @Column(length = 64)
    private String tag;

    @Column(name = "media_url", length = 1024)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private PostStatus status = PostStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
