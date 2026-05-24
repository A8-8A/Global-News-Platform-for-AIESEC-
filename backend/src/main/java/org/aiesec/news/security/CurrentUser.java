package org.aiesec.news.security;

import org.aiesec.news.exception.AuthException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Helper to read the authenticated user's id out of the security context.
 *
 * The JwtAuthenticationFilter stores our user id (as a String) as the
 * authentication principal. Controllers call {@link #requireId()} to get
 * the id of whoever made the request.
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    /** The current user's id, or throws if the request is unauthenticated. */
    public static Long requireId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null
                || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AuthException("Not authenticated.");
        }
        try {
            return Long.valueOf(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            throw new AuthException("Invalid authentication principal.");
        }
    }
}
