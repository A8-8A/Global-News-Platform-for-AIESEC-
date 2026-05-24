package org.aiesec.news.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Minimal projection of the AIESEC GIS {@code currentPerson} query
 * result - only the fields we need for identity + role detection.
 *
 * The GraphQL query we send (see AiesecGisService) selects exactly
 * these fields, so the rest of the large schema is ignored.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CurrentPersonResponse(
        String id,
        String full_name,
        List<Position> current_positions
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Position(
            String title,
            Constant role,
            Office office
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Constant(
            String name
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Office(
            String id,
            String name
    ) {
    }
}
