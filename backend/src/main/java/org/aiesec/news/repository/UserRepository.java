package org.aiesec.news.repository;

import org.aiesec.news.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /** Find an AIESEC user by their GIS person ID (used on OAuth login). */
    Optional<User> findByAiesecPersonId(String aiesecPersonId);

    /** Find an admin by email (used on admin login). */
    Optional<User> findByEmail(String email);
}
