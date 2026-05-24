package org.aiesec.news.config;

import org.aiesec.news.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security configuration.
 *
 * Auth model - there are TWO ways to obtain a session, but ONE token type:
 *   1. MCP / Member  -> AIESEC OAuth 2.0 -> backend issues our JWT.
 *   2. Admin         -> separate email+password login -> backend issues our JWT.
 *
 * Both result in our own JWT. This filter chain is stateless: it does not
 * care HOW the JWT was obtained, only that it is valid. Role-based access
 * (MCP vs MEMBER vs ADMIN) is enforced from a claim inside that JWT.
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                // Stateless API: no server sessions, no CSRF token needed.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // --- Public: no token required ---
                        .requestMatchers("/health").permitAll()
                        // OAuth callback + admin login must be reachable
                        // before a token exists.
                        .requestMatchers("/api/auth/**").permitAll()
                        // Reading the feed is public (approved posts only).
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/feed/**").permitAll()

                        // --- Admin-only ---
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // --- Everything else needs a valid session ---
                        .anyRequest().authenticated()
                )

                // Validate our JWT before the username/password filter.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
