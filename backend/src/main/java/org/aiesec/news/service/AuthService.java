package org.aiesec.news.service;

import org.aiesec.news.domain.Role;
import org.aiesec.news.domain.User;
import org.aiesec.news.dto.AiesecTokenResponse;
import org.aiesec.news.dto.AuthDtos.LoginResponse;
import org.aiesec.news.dto.AuthDtos.UserProfile;
import org.aiesec.news.dto.CurrentPersonResponse;
import org.aiesec.news.exception.AuthException;
import org.aiesec.news.repository.UserRepository;
import org.aiesec.news.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication orchestration.
 *
 * At login we now extract and persist:
 *   - profile_photo → User.photoUrl  (pre-populates avatar from EXPA)
 *   - home_lc data  → User.lcName, User.mcName
 *   - office ISO-2  → User.officeCode  (drives globe + flag chips)
 *   - role title    → User.roleTitle
 *
 * On subsequent logins these values are refreshed so EXPA changes
 * (photo update, entity transfer) are reflected automatically.
 * The one exception is photoUrl: if the user has uploaded their own
 * Firebase photo we keep it rather than overwriting with the EXPA one.
 */
@Service
public class AuthService {

    private final AiesecOAuthService oauthService;
    private final AiesecGisService   gisService;
    private final UserRepository     userRepository;
    private final JwtService         jwtService;
    private final PasswordEncoder    passwordEncoder;

    public AuthService(AiesecOAuthService oauthService,
                       AiesecGisService   gisService,
                       UserRepository     userRepository,
                       JwtService         jwtService,
                       PasswordEncoder    passwordEncoder) {
        this.oauthService    = oauthService;
        this.gisService      = gisService;
        this.userRepository  = userRepository;
        this.jwtService      = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public LoginResponse loginWithAiesec(String code) {
        AiesecTokenResponse aiesecToken = oauthService.exchangeCodeForToken(code);
        CurrentPersonResponse person    = gisService.fetchCurrentPerson(aiesecToken.accessToken());

        Role                          role       = gisService.detectRole(person);
        CurrentPersonResponse.Office  office     = gisService.primaryOffice(person);
        String                        officeCode = gisService.deriveOfficeCode(person);
        String                        lcName     = gisService.deriveLcName(person);
        String                        mcName     = gisService.deriveMcName(person);

        User user = upsertAiesecUser(person, role, office, officeCode, lcName, mcName);
        String jwt = jwtService.issue(user);
        return new LoginResponse(jwt, toProfile(user));
    }

    @Transactional(readOnly = true)
    public LoginResponse loginAsAdmin(String email, String rawPassword) {
        User admin = userRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.ADMIN)
                .orElseThrow(() -> new AuthException("Invalid email or password."));

        if (admin.getPasswordHash() == null
                || !passwordEncoder.matches(rawPassword, admin.getPasswordHash())) {
            throw new AuthException("Invalid email or password.");
        }
        String jwt = jwtService.issue(admin);
        return new LoginResponse(jwt, toProfile(admin));
    }

    @Transactional(readOnly = true)
    public UserProfile getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found."));
        return toProfile(user);
    }

    // --- internals ---

    private User upsertAiesecUser(CurrentPersonResponse person,
                                  Role role,
                                  CurrentPersonResponse.Office office,
                                  String officeCode,
                                  String lcName,
                                  String mcName) {
        if (person.id() == null) {
            throw new AuthException("AIESEC did not return a person id.");
        }

        String officeId   = office != null ? office.id()   : null;
        String officeName = office != null ? office.name() : null;

        // Role title from first current position
        String roleTitle = null;
        if (person.current_positions() != null && !person.current_positions().isEmpty()) {
            roleTitle = person.current_positions().get(0).title();
        }

        // EXPA profile photo — only use as initial value; don't overwrite
        // a Firebase photo the user has already set.
        String expaPhoto = person.profile_photo();

        return userRepository.findByAiesecPersonId(person.id())
                .map(existing -> {
                    existing.setFullName(person.full_name());
                    existing.setRole(role);
                    existing.setOfficeId(officeId);
                    existing.setOfficeName(officeName);
                    existing.setOfficeCode(officeCode);
                    existing.setLcName(lcName);
                    existing.setMcName(mcName);
                    existing.setRoleTitle(roleTitle);
                    // Only backfill photo from EXPA if the user hasn't
                    // uploaded their own Firebase photo yet.
                    if (existing.getPhotoUrl() == null && expaPhoto != null) {
                        existing.setPhotoUrl(expaPhoto);
                    }
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(
                        User.aiesecUser(
                                person.id(), person.full_name(),
                                officeId, officeName,
                                role, roleTitle,
                                officeCode, lcName, mcName,
                                expaPhoto)));
    }

    public static UserProfile toProfile(User u) {
        return new UserProfile(
                u.getId(),
                u.getRole().name(),
                u.getFullName(),
                u.getEmail(),
                u.getOfficeId(),
                u.getOfficeName(),
                u.getPhotoUrl(),
                u.getRoleTitle());
    }
}
