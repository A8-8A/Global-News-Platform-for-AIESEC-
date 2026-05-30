package org.aiesec.news.dto;

import jakarta.validation.constraints.Size;

/**
 * Request/response payloads for user profile endpoints.
 */
public final class UserDtos {

    private UserDtos() {}

    /**
     * Full profile response — GET /api/users/:id.
     *
     * Includes all fields the ProfilePage needs:
     *   - EXPA identity: officeName (LC), mcName, officeCode, roleTitle
     *   - User-editable: bio, photoUrl
     */
    public record UserProfileResponse(
            Long   id,
            String fullName,
            String email,
            String officeName,   // LC name  e.g. "AIESEC in Beirut"
            String mcName,       // MC name  e.g. "AIESEC in Lebanon"
            String officeCode,   // ISO-2    e.g. "LB"
            String roleTitle,    // e.g. "Member Committee President"
            String bio,
            String photoUrl
    ) {}

    /**
     * PUT /api/users/:id — only the two user-editable fields.
     * Null means "leave unchanged".
     */
    public record UpdateProfileRequest(
            @Size(max = 2000, message = "Bio is too long")
            String bio,

            @Size(max = 1024, message = "Photo URL is too long")
            String photoUrl,

            @Size(max = 320, message = "Email is too long")
            String email
    ) {}
}
