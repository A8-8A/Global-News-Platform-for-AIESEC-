package org.aiesec.news.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestClient;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Application-wide beans.
 */
@Configuration
public class BeanConfig {

    /**
     * Shared HTTP client for outbound calls to AIESEC
     * (OAuth token endpoint + GraphQL GIS API).
     */
    @Bean
    RestClient aiesecRestClient() {
        return RestClient.builder().build();
    }

    /**
     * BCrypt encoder - hashes admin passwords.
     * AIESEC (MCP/Member) users have NO password here; they auth via OAuth.
     * This is only for the separate admin login.
     */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS: the frontend lives on a different origin (Firebase Hosting)
     * than this API (Render), so cross-origin requests must be allowed.
     * Allowed origins come from config so localhost works in dev.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties props) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(props.cors().allowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
