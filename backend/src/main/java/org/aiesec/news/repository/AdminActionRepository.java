package org.aiesec.news.repository;

import org.aiesec.news.domain.AdminAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminActionRepository extends JpaRepository<AdminAction, Long> {

    /** Audit log, newest first. */
    List<AdminAction> findAllByOrderByCreatedAtDesc();
}
