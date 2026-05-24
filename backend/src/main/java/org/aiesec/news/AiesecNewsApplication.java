package org.aiesec.news;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Global AIESEC News Platform - backend entry point.
 *
 * Responsibilities of this service:
 *  - Hold the AIESEC OAuth client_secret and perform the code->token exchange.
 *  - Call the AIESEC GIS GraphQL API to identify the logged-in person + role.
 *  - Issue our own JWT session tokens (for both AIESEC users and admins).
 *  - Enforce posting rules (max 2 posts/week per MCP, overflow to approval queue).
 *  - Serve the moderated news feed, likes, comments.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class AiesecNewsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiesecNewsApplication.class, args);
    }
}
