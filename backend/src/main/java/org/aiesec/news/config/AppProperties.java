package org.aiesec.news.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Type-safe binding of all {@code app.*} configuration keys.
 *
 * Backed by the active Spring profile (staging / prod), so the AIESEC
 * URLs differ per environment while the code stays identical.
 *
 * Injected wherever config is needed - never read env vars directly.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Cors cors,
        Jwt jwt,
        Posting posting,
        Aiesec aiesec
) {

    /** Which frontend origins may call this API (CORS). */
    public record Cors(List<String> allowedOrigins) {
    }

    /** Settings for the JWT session tokens WE issue. */
    public record Jwt(
            String secret,
            long expirationMs
    ) {
    }

    /** Posting rules from the platform spec. */
    public record Posting(
            int maxPostsPerWeek,
            int weekWindowDays
    ) {
    }

    /**
     * AIESEC OAuth + GIS API settings.
     * {@code clientId} / {@code clientSecret} / {@code redirectUri} come from
     * env vars; the URLs come from the active profile.
     */
    public record Aiesec(
            String clientId,
            String clientSecret,
            String redirectUri,
            String authBaseUrl,
            String authorizePath,
            String tokenPath,
            String graphqlUrl
    ) {
        /** Full URL the user is redirected to, to start the OAuth flow. */
        public String authorizeUrl() {
            return authBaseUrl + authorizePath;
        }

        /** Full URL the backend POSTs to, to exchange code/refresh for tokens. */
        public String tokenUrl() {
            return authBaseUrl + tokenPath;
        }
    }
}
