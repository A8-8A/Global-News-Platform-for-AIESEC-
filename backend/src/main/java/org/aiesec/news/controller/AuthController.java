package org.aiesec.news.controller;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.aiesec.news.dto.AuthDtos.AdminLoginRequest;
import org.aiesec.news.dto.AuthDtos.AiesecLoginRequest;
import org.aiesec.news.dto.AuthDtos.LoginResponse;
import org.aiesec.news.dto.AuthDtos.UserProfile;
import org.aiesec.news.exception.AuthException;
import org.aiesec.news.security.JwtService;
import org.aiesec.news.service.AuthService;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints.
 *
 *   POST /api/auth/aiesec  - complete AIESEC OAuth login
 *   POST /api/auth/admin   - admin email/password login
 *   GET  /api/auth/me      - returns the profile encoded in the JWT
 *
 * /me reads exclusively from the JWT — zero DB calls.
 * This makes it immune to any schema or DB issues and always fast.
 * The full profile (with bio, photo, officeCode etc.) is at GET /api/users/:id.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService  jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService  = jwtService;
    }

    @PostMapping("/aiesec")
    public LoginResponse loginWithAiesec(@Valid @RequestBody AiesecLoginRequest request) {
        return authService.loginWithAiesec(request.code());
    }

    @PostMapping("/admin")
    public LoginResponse loginAsAdmin(@Valid @RequestBody AdminLoginRequest request) {
        return authService.loginAsAdmin(request.email(), request.password());
    }

    /**
     * Returns the logged-in user's core identity from the JWT.
     * No DB call — works regardless of schema state.
     */
    @GetMapping("/me")
    public UserProfile me(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new AuthException("Not authenticated.");
        }
        Claims claims = jwtService.parse(header.substring(7));

        Long   userId = Long.valueOf(claims.getSubject());
        String role   = claims.get("role", String.class);
        String name   = claims.get("name", String.class);

        return new UserProfile(userId, role, name, null, null, null, null, null);
    }
}
