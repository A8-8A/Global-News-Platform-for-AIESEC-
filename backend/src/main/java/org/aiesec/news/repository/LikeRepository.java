package org.aiesec.news.repository;

import org.aiesec.news.domain.Like;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {

    long countByPostId(Long postId);

    /** Has this user already liked this post? Drives like/unlike toggling. */
    Optional<Like> findByPostIdAndUserId(Long postId, Long userId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);
}
