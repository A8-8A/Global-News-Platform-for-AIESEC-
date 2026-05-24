package org.aiesec.news.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.aiesec.news.config.AppProperties;
import org.aiesec.news.domain.User;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * Issues and validates the session JWTs that THIS backend uses.
 *
 * Important distinction: this token is ours, not AIESEC's. After a user
 * authenticates - whether via AIESEC OAuth or admin login - we mint one
 * of these and the frontend sends it back on every request. The AIESEC
 * access token is a separate thing handled server-side only.
 *
 * Claims carried: subject = our user id, plus role and a display name.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(AppProperties props) {
        this.key = Keys.hmacShaKeyFor(
                props.jwt().secret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = props.jwt().expirationMs();
    }

    /** Mint a session token for a freshly authenticated user. */
    public String issue(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("role", user.getRole().name())
                .claim("name", displayName(user))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    /**
     * Parse + verify a token. Throws if the signature is invalid or the
     * token has expired.
     */
    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private static String displayName(User user) {
        return user.getFullName() != null ? user.getFullName() : user.getEmail();
    }
}
