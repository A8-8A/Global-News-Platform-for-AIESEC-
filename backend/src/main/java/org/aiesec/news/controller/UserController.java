package org.aiesec.news.controller;

import jakarta.validation.Valid;
import org.aiesec.news.dto.UserDtos.UpdateProfileRequest;
import org.aiesec.news.dto.UserDtos.UserProfileResponse;
import org.aiesec.news.security.CurrentUser;
import org.aiesec.news.service.UserService;
import org.springframework.web.bind.annotation.*;

/**
 * Public user profile endpoints.
 *
 *   GET  /api/users/{id}   - view any member's profile (public)
 *   PUT  /api/users/{id}   - update own profile (bio + photoUrl, auth required)
 *
 * GET is public so that unauthenticated readers can visit author profiles
 * by clicking a name on the feed. PUT requires a session and only the
 * owner may update their own record (enforced in UserService).
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** View any AIESEC member's profile. Public - no token needed. */
    @GetMapping("/{id}")
    public UserProfileResponse getProfile(@PathVariable Long id) {
        return userService.getProfile(id);
    }

    /** Update own profile (bio and/or photoUrl). Requires a session. */
    @PutMapping("/{id}")
    public UserProfileResponse updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(id, request, CurrentUser.requireId());
    }
}
