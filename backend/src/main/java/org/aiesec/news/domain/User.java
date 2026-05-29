package org.aiesec.news.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A platform user. Two kinds, distinguished by {@link #role}:
 *
 *  - AIESEC user (MCP / MEMBER): created on first OAuth login.
 *    {@code aiesecPersonId} is set; {@code passwordHash} is null.
 *  - Admin (ADMIN): seeded separately.
 *    {@code email} + {@code passwordHash} are set; {@code aiesecPersonId} is null.
 *
 * V2 adds: bio, photoUrl, roleTitle, officeCode, lcName, mcName.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Role role;

    // --- AIESEC identity (null for admins) ---

    @Column(name = "aiesec_person_id", unique = true, length = 64)
    private String aiesecPersonId;

    @Column(name = "full_name")
    private String fullName;

    /** Numeric EXPA office ID of the user's current entity. */
    @Column(name = "office_id", length = 64)
    private String officeId;

    @Column(name = "office_name")
    private String officeName;

    /**
     * ISO-3166-1 alpha-2 country code derived from the EXPA office ID
     * at login time (e.g. "LB" for Lebanon, "BR" for Brazil).
     * Used by the globe, country flags, and OfficeTag chips.
     * Null until the user logs in after V2 migration.
     */
    @Column(name = "office_code", length = 4)
    private String officeCode;

    /** LC name from home_lc.name (e.g. "AIESEC in Beirut"). */
    @Column(name = "lc_name", length = 255)
    private String lcName;

    /** MC name from home_lc.parent.name (e.g. "AIESEC in Lebanon"). */
    @Column(name = "mc_name", length = 255)
    private String mcName;

    // --- Admin identity (null for AIESEC users) ---

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    // --- Profile fields (V2) ---

    @Column(columnDefinition = "text")
    private String bio;

    /**
     * Profile photo URL. Set from EXPA's profile_photo at login time,
     * and can be overwritten by the user uploading their own via
     * Firebase Storage (PUT /api/users/:id).
     */
    @Column(name = "photo_url", length = 1024)
    private String photoUrl;

    @Column(name = "role_title", length = 255)
    private String roleTitle;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    /** Factory for a new AIESEC (OAuth) user — called on first login. */
    public static User aiesecUser(String personId, String fullName,
                                  String officeId, String officeName,
                                  Role role, String roleTitle,
                                  String officeCode, String lcName,
                                  String mcName, String photoUrl) {
        User u = new User();
        u.role       = role;
        u.aiesecPersonId = personId;
        u.fullName   = fullName;
        u.officeId   = officeId;
        u.officeName = officeName;
        u.roleTitle  = roleTitle;
        u.officeCode = officeCode;
        u.lcName     = lcName;
        u.mcName     = mcName;
        u.photoUrl   = photoUrl;
        return u;
    }
}
