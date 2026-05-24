package org.aiesec.news.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health endpoint.
 *
 * Purpose beyond a simple liveness check: Render's free tier sleeps the
 * service after ~15 min idle, and Neon sleeps the DB too. An external
 * uptime pinger hitting GET /health every ~10 min keeps BOTH warm,
 * because this endpoint runs a trivial query that wakes the database.
 */
@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        boolean dbUp;
        try {
            Integer one = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbUp = Integer.valueOf(1).equals(one);
        } catch (Exception e) {
            dbUp = false;
        }
        return Map.of(
                "status", dbUp ? "UP" : "DEGRADED",
                "database", dbUp ? "UP" : "DOWN"
        );
    }
}
