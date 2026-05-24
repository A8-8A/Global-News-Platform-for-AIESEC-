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
 * The DB CHECK constraint (see V1 migration) enforces that a row cannot
 * be a malformed mix of the two.
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

    /** The person's ID in the AIESEC GIS - our stable link to EXPA. */
    @Column(name = "aiesec_person_id", unique = true, length = 64)
    private String aiesecPersonId;

    @Column(name = "full_name")
    private String fullName;

    /** Office ID of the user's current entity (for display + role context). */
    @Column(name = "office_id", length = 64)
    private String officeId;

    @Column(name = "office_name")
    private String officeName;

    // --- Admin identity (null for AIESEC users) ---

    @Column(unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    /** Factory for an AIESEC (OAuth) user. */
    public static User aiesecUser(String personId, String fullName,
                                  String officeId, String officeName, Role role) {
        User u = new User();
        u.role = role;
        u.aiesecPersonId = personId;
        u.fullName = fullName;
        u.officeId = officeId;
        u.officeName = officeName;
        return u;
    }
}
