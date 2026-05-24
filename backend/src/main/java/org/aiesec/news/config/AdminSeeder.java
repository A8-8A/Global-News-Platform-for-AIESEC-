package org.aiesec.news.config;

import org.aiesec.news.domain.Role;
import org.aiesec.news.domain.User;
import org.aiesec.news.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seeds the initial admin account on startup.
 *
 * Admins are NOT AIESEC users - they cannot be created via OAuth, so
 * the very first one has to come from somewhere. This reads two env
 * vars (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD) and, if an admin with
 * that email does not already exist, creates one with a BCrypt-hashed
 * password.
 *
 * Safe to run every boot: it is idempotent (skips if the admin exists)
 * and does nothing at all if the env vars are unset.
 */
@Configuration
public class AdminSeeder {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    @Bean
    ApplicationRunner seedAdmin(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                @Value("${ADMIN_SEED_EMAIL:}") String email,
                                @Value("${ADMIN_SEED_PASSWORD:}") String password) {
        return args -> {
            if (email.isBlank() || password.isBlank()) {
                log.info("Admin seed env vars not set - skipping admin seeding.");
                return;
            }
            if (userRepository.findByEmail(email).isPresent()) {
                log.info("Admin '{}' already exists - skipping seeding.", email);
                return;
            }
            User admin = new User();
            admin.setRole(Role.ADMIN);
            admin.setEmail(email);
            admin.setPasswordHash(passwordEncoder.encode(password));
            userRepository.save(admin);
            log.info("Seeded initial admin account: {}", email);
        };
    }
}
