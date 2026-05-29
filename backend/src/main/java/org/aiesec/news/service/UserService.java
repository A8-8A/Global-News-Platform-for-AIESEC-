package org.aiesec.news.service;

import org.aiesec.news.domain.User;
import org.aiesec.news.dto.UserDtos.UpdateProfileRequest;
import org.aiesec.news.dto.UserDtos.UserProfileResponse;
import org.aiesec.news.exception.ForbiddenException;
import org.aiesec.news.exception.NotFoundException;
import org.aiesec.news.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User profile logic.
 *   getProfile(id)                     — public; any member's profile
 *   updateProfile(id, req, requesterId) — owner-only; bio + photoUrl
 *
 * Admins (no aiesecPersonId) return 404 — the console is separate.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        return toResponse(requireAiesecUser(userId));
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId,
                                             UpdateProfileRequest request,
                                             Long requesterId) {
        if (!userId.equals(requesterId)) {
            throw new ForbiddenException("You can only update your own profile.");
        }
        User user = requireAiesecUser(userId);

        if (request.bio() != null) {
            user.setBio(request.bio().isBlank() ? null : request.bio());
        }
        if (request.photoUrl() != null) {
            user.setPhotoUrl(request.photoUrl().isBlank() ? null : request.photoUrl());
        }

        return toResponse(userRepository.save(user));
    }

    // --- internals ---

    private User requireAiesecUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found."));
        if (user.getAiesecPersonId() == null) {
            throw new NotFoundException("User not found.");
        }
        return user;
    }

    private static UserProfileResponse toResponse(User u) {
        return new UserProfileResponse(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getOfficeName(),   // LC name
                u.getMcName(),       // MC name (new)
                u.getOfficeCode(),   // ISO-2   (new)
                u.getRoleTitle(),
                u.getBio(),
                u.getPhotoUrl());
    }
}
