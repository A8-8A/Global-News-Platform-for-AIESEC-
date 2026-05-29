package org.aiesec.news.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Projection of the AIESEC GIS {@code currentPerson} query result.
 *
 * Fields fetched (see AiesecGisService.CURRENT_PERSON_QUERY):
 *   id, full_name, profile_photo
 *   home_lc { id, name, tag, parent { id, name } }
 *   current_positions { title, role { name }, office { id, name, tag } }
 *
 * profile_photo  — direct URL on the Person; used to pre-populate photoUrl
 *                  so the TopNav avatar shows the EXPA photo from first login.
 * home_lc        — the LC the person belongs to; parent is the MC above it.
 *                  Used for lc_name / mc_name on the profile page.
 * office.tag     — "MC" or "LC"; used to cross-check isMcpPosition against
 *                  the numeric office-id list (belt-and-suspenders).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CurrentPersonResponse(
        String id,
        String full_name,
        String profile_photo,
        HomeLc home_lc,
        List<Position> current_positions
) {

    /** The LC the person is registered in (not necessarily their current role). */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record HomeLc(
            String id,
            String name,
            String tag,        // "LC" or "MC"
            Office parent      // the MC above this LC; null if this is an MC
    ) {
    }

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
            String name,
            String tag         // "MC" or "LC"
    ) {
    }
}
