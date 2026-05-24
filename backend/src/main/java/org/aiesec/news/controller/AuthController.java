package org.aiesec.news.controller;

import jakarta.validation.Valid;
import org.aiesec.news.dto.AuthDtos.AdminLoginRequest;
import org.aiesec.news.dto.AuthDtos.AiesecLoginRequest;
import org.aiesec.news.dto.AuthDtos.LoginResponse;
import org.aiesec.news.dto.AuthDtos.UserProfile;
import org.aiesec.news.security.CurrentUser;
import org.aiesec.news.service.AuthService;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints.
 *
 *   POST /api/auth/aiesec  - complete AIESEC OAuth login (frontend sends
 *                            the code it received at the redirect URI)
 *   POST /api/auth/admin   - admin email/password login
 *   GET  /api/auth/me      - profile of the currently logged-in user
 *
 * The first two are public (no token yet); /me requires a valid session.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Exchange the OAuth code (server-side) and start a session. */
    @PostMapping("/aiesec")
    public LoginResponse loginWithAiesec(@Valid @RequestBody AiesecLoginRequest request) {
        return authService.loginWithAiesec(request.code());
    }

    /** Admin login via the separate credential path. */
    @PostMapping("/admin")
    public LoginResponse loginAsAdmin(@Valid @RequestBody AdminLoginRequest request) {
        return authService.loginAsAdmin(request.email(), request.password());
    }

    /** Who am I - lets the frontend restore session state on reload. */
    @GetMapping("/me")
    public UserProfile me() {
        return authService.getProfile(CurrentUser.requireId());
    }
}
