package org.aiesec.news.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Like {@link CurrentUser}, but for endpoints that are public yet
 * personalise their response if a user happens to be logged in
 * (e.g. the feed filling in {@code likedByMe}).
 *
 * Returns the user id if a valid session is present, or null otherwise -
 * it never throws.
 */
public final class OptionalCurrentUser {

    private OptionalCurrentUser() {
    }

    public static Long idOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null
                || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        try {
            return Long.valueOf(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
