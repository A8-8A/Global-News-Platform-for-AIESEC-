package org.aiesec.news.service;

import org.aiesec.news.config.AppProperties;
import org.aiesec.news.dto.AiesecTokenResponse;
import org.aiesec.news.exception.AuthException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/**
 * Handles the AIESEC OAuth 2.0 token exchange.
 *
 * This is the step that MUST happen server-side: it sends the
 * client_secret to AIESEC. The browser never sees the secret and
 * never calls this endpoint directly.
 *
 * Flow: the frontend receives a temporary {@code code} at the redirect
 * URI and posts it to our backend; we swap it here for an access token.
 */
@Service
public class AiesecOAuthService {

    private final RestClient http;
    private final AppProperties.Aiesec config;

    public AiesecOAuthService(RestClient aiesecRestClient, AppProperties props) {
        this.http = aiesecRestClient;
        this.config = props.aiesec();
    }

    /**
     * Exchange a temporary authorization code for an access token.
     *
     * Mirrors the documented request:
     *   POST {auth}/oauth/token
     *   grant_type=authorization_code, client_id, client_secret,
     *   redirect_uri, code
     */
    public AiesecTokenResponse exchangeCodeForToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", config.clientId());
        form.add("client_secret", config.clientSecret());
        form.add("redirect_uri", config.redirectUri());
        form.add("code", code);

        try {
            AiesecTokenResponse token = http.post()
                    .uri(config.tokenUrl())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(AiesecTokenResponse.class);

            if (token == null || token.accessToken() == null) {
                throw new AuthException("AIESEC returned no access token.");
            }
            return token;
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            // Wrong/expired code, redirect_uri mismatch, network error, etc.
            throw new AuthException("Failed to exchange authorization code with AIESEC.", e);
        }
    }
}
