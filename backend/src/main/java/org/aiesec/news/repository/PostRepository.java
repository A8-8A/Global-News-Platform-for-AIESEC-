package org.aiesec.news.repository;

import org.aiesec.news.domain.Post;
import org.aiesec.news.domain.PostStatus;
import org.aiesec.news.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    /** Public feed: approved posts, newest first. */
    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);

    /** Admin approval queue. */
    List<Post> findByStatusOrderByCreatedAtAsc(PostStatus status);

    /**
     * Weekly-limit check: how many posts has this author created since the
     * given instant. The window is "now - 7 days", computed by the caller.
     * Stateless - no counter to drift.
     */
    long countByAuthorAndCreatedAtAfter(User author, Instant since);

    /** An MCP's own posts (any status), newest first. */
    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    /** Count an author's posts in a given status - for MCP activity summary. */
    long countByAuthorIdAndStatus(Long authorId, PostStatus status);

    /** Count all of an author's posts - for MCP activity summary. */
    long countByAuthorId(Long authorId);
}
