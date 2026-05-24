package org.aiesec.news.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * The token payload AIESEC returns from POST /oauth/token.
 * We mainly need {@code accessToken}; refresh handling can come later.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiesecTokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("expires_in") Long expiresIn,
        @JsonProperty("token_type") String tokenType
) {
}
