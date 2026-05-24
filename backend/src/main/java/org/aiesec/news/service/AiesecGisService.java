package org.aiesec.news.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.aiesec.news.config.AppProperties;
import org.aiesec.news.domain.Role;
import org.aiesec.news.dto.CurrentPersonResponse;
import org.aiesec.news.exception.AuthException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Talks to the AIESEC GIS GraphQL API.
 *
 * For this MVP the GIS API is used for exactly one purpose: given a
 * user's access token, find out who they are and whether they are an
 * MCP or a regular member. All posts/likes/comments live in our own DB.
 *
 * Role detection rule (documented, deterministic):
 *   A user is an MCP if they hold a current position whose office is a
 *   Member Committee (office id is in the known MC set) AND whose role
 *   or title indicates president. Otherwise they are a MEMBER.
 */
@Service
public class AiesecGisService {

    /** The currentPerson query - selects only the fields we need. */
    private static final String CURRENT_PERSON_QUERY = """
            {
              currentPerson {
                id
                full_name
                current_positions {
                  title
                  role { name }
                  office { id name }
                }
              }
            }
            """;

    private final RestClient http;
    private final String graphqlUrl;

    /** Office IDs that are Member Committees (loaded from a resource file). */
    private final Set<String> mcOfficeIds;

    public AiesecGisService(RestClient aiesecRestClient, AppProperties props) {
        this.http = aiesecRestClient;
        this.graphqlUrl = props.aiesec().graphqlUrl();
        this.mcOfficeIds = loadMcOfficeIds();
    }

    /**
     * Fetch the logged-in person's identity using their AIESEC access token.
     */
    public CurrentPersonResponse fetchCurrentPerson(String accessToken) {
        try {
            JsonNode root = http.post()
                    .uri(graphqlUrl)
                    .header(HttpHeaders.AUTHORIZATION, accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("query", CURRENT_PERSON_QUERY))
                    .retrieve()
                    .body(JsonNode.class);

            if (root == null) {
                throw new AuthException("Empty response from AIESEC GIS API.");
            }
            // GraphQL puts payload under "data" and errors under "errors".
            if (root.has("errors") && !root.get("errors").isEmpty()) {
                throw new AuthException("AIESEC GIS API returned an error for currentPerson.");
            }
            JsonNode personNode = root.path("data").path("currentPerson");
            if (personNode.isMissingNode() || personNode.isNull()) {
                throw new AuthException("Could not resolve the current person from AIESEC.");
            }

            return JsonMapper.shared().treeToValue(personNode, CurrentPersonResponse.class);
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("Failed to query the AIESEC GIS API.", e);
        }
    }

    /**
     * Decide the platform role for a person based on their AIESEC positions.
     */
    public Role detectRole(CurrentPersonResponse person) {
        if (person.current_positions() == null) {
            return Role.MEMBER;
        }
        boolean isMcp = person.current_positions().stream()
                .anyMatch(this::isMcpPosition);
        return isMcp ? Role.MCP : Role.MEMBER;
    }

    /**
     * The person's "home" office - first current position's office, used
     * for display (author entity on posts). Falls back to nulls.
     */
    public CurrentPersonResponse.Office primaryOffice(CurrentPersonResponse person) {
        if (person.current_positions() == null) {
            return null;
        }
        return person.current_positions().stream()
                .map(CurrentPersonResponse.Position::office)
                .filter(o -> o != null)
                .findFirst()
                .orElse(null);
    }

    // --- internals ---

    private boolean isMcpPosition(CurrentPersonResponse.Position pos) {
        if (pos == null || pos.office() == null || pos.office().id() == null) {
            return false;
        }
        // 1. The position must be in a Member Committee office.
        if (!mcOfficeIds.contains(pos.office().id())) {
            return false;
        }
        // 2. The role/title must indicate president (LCP is also "president"
        //    but in an LC office, which step 1 already excludes).
        String role = pos.role() != null && pos.role().name() != null
                ? pos.role().name().toLowerCase() : "";
        String title = pos.title() != null ? pos.title().toLowerCase() : "";
        return role.contains("president") || title.contains("president");
    }

    private Set<String> loadMcOfficeIds() {
        try {
            String csv = new String(
                    new ClassPathResource("mc-office-ids.txt")
                            .getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8);
            return Arrays.stream(csv.trim().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
        } catch (IOException e) {
            throw new IllegalStateException("Could not load mc-office-ids.txt", e);
        }
    }
}
