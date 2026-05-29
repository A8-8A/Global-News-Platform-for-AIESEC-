package org.aiesec.news.config;

import org.aiesec.news.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security configuration.
 *
 * Public endpoints (no token required):
 *   GET  /api/feed/**       - the public news feed
 *   GET  /api/users/**      - member profiles (read-only, for author links)
 *   POST /api/auth/**       - login (AIESEC OAuth + admin)
 *   GET  /health            - health check
 *
 * Everything else requires a valid session JWT.
 * Role rules beyond "logged in" (MCP-only create, ADMIN-only moderation)
 * are enforced in the service layer.
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
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // --- Public: no token required ---
                        .requestMatchers("/health").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/feed/**").permitAll()
                        // Profile pages are public so any reader can click
                        // an author's name without needing to sign in.
                        .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()

                        // --- Admin-only ---
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // --- Everything else needs a valid session ---
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
