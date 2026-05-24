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
 * Two entry points, both ending in "issue our JWT":
 *
 *  loginWithAiesec(code):
 *    1. exchange the OAuth code for an AIESEC access token
 *    2. call the GIS API to identify the person + detect role
 *    3. create or update the local user record
 *    4. issue our session JWT
 *
 *  loginAsAdmin(email, password):
 *    1. look up the admin, verify the password hash
 *    2. issue our session JWT
 *
 * We never store the AIESEC access token or the user's AIESEC password.
 */
@Service
public class AuthService {

    private final AiesecOAuthService oauthService;
    private final AiesecGisService gisService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AiesecOAuthService oauthService,
                       AiesecGisService gisService,
                       UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.oauthService = oauthService;
        this.gisService = gisService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    /** AIESEC OAuth login - see class doc for the four steps. */
    @Transactional
    public LoginResponse loginWithAiesec(String code) {
        // 1. code -> AIESEC access token (server-side, uses client_secret)
        AiesecTokenResponse aiesecToken = oauthService.exchangeCodeForToken(code);

        // 2. identify the person + role
        CurrentPersonResponse person =
                gisService.fetchCurrentPerson(aiesecToken.accessToken());
        Role role = gisService.detectRole(person);
        CurrentPersonResponse.Office office = gisService.primaryOffice(person);

        // 3. upsert the local user
        User user = upsertAiesecUser(person, role, office);

        // 4. issue our JWT
        String jwt = jwtService.issue(user);
        return new LoginResponse(jwt, toProfile(user));
    }

    /** Admin login - separate credential path, not OAuth. */
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

    /** Look up a user by id - used by GET /api/auth/me. */
    @Transactional(readOnly = true)
    public UserProfile getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found."));
        return toProfile(user);
    }

    // --- internals ---

    private User upsertAiesecUser(CurrentPersonResponse person, Role role,
                                  CurrentPersonResponse.Office office) {
        if (person.id() == null) {
            throw new AuthException("AIESEC did not return a person id.");
        }
        String officeId = office != null ? office.id() : null;
        String officeName = office != null ? office.name() : null;

        return userRepository.findByAiesecPersonId(person.id())
                .map(existing -> {
                    // Refresh details that may have changed in EXPA
                    // (e.g. a member became an MCP, or changed entity).
                    existing.setFullName(person.full_name());
                    existing.setRole(role);
                    existing.setOfficeId(officeId);
                    existing.setOfficeName(officeName);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(
                        User.aiesecUser(person.id(), person.full_name(),
                                officeId, officeName, role)));
    }

    private static UserProfile toProfile(User u) {
        return new UserProfile(
                u.getId(),
                u.getRole().name(),
                u.getFullName(),
                u.getEmail(),
                u.getOfficeId(),
                u.getOfficeName());
    }
}
