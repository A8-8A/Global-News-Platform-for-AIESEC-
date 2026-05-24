package org.aiesec.news.domain;

/**
 * Lifecycle status of a post.
 *
 *  APPROVED - visible in the public feed.
 *  PENDING  - awaiting an admin decision (overflow past the weekly limit).
 *  REJECTED - rejected by an admin; visible to the author only.
 */
public enum PostStatus {
    APPROVED,
    PENDING,
    REJECTED
}
