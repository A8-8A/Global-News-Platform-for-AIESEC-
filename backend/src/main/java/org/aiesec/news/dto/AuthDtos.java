package org.aiesec.news.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request/response payloads for our own auth endpoints.
 */
public final class AuthDtos {

    private AuthDtos() {
    }

    /** POST /api/auth/aiesec - body. */
    public record AiesecLoginRequest(
            @NotBlank(message = "Authorization code is required")
            String code
    ) {
    }

    /** POST /api/auth/admin - body. */
    public record AdminLoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password
    ) {
    }

    /** Response for both login endpoints: our JWT + the user profile. */
    public record LoginResponse(
            String token,
            UserProfile user
    ) {
    }

    /** The user info the frontend needs (also returned by /api/auth/me). */
    public record UserProfile(
            Long id,
            String role,
            String fullName,
            String email,
            String officeId,
            String officeName
    ) {
    }
}
