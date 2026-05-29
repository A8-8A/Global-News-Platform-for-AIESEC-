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
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Talks to the AIESEC GIS GraphQL API.
 *
 * Three things are now extracted at login:
 *
 *  1. Identity + role  — id, full_name, current_positions (unchanged logic)
 *  2. Profile photo    — profile_photo field on currentPerson; stored in
 *                        User.photoUrl so the TopNav avatar is populated
 *                        immediately from first login.
 *  3. Home entity      — home_lc { id, name, tag, parent { id, name } }
 *                        gives us lcName (home LC) and mcName (its MC parent).
 *                        The office_code (ISO-2) is derived from the numeric
 *                        EXPA office ID via MC_OFFICE_ISO, a hardcoded map
 *                        built from the official AIESEC office list.
 *
 * ISO-2 derivation rule:
 *   - If the user is an MCP their "home" is the MC itself; use the
 *     MCP position's office.id to look up the ISO-2 code.
 *   - Otherwise use home_lc.parent.id (the MC above their LC) if it
 *     exists, falling back to home_lc.id.
 *   - If the derived id is not in MC_OFFICE_ISO the code is null
 *     (graceful degradation — globe just won't highlight their country).
 */
@Service
public class AiesecGisService {

    /**
     * Updated query — adds profile_photo and home_lc (with parent for
     * the MC name), while keeping current_positions for role detection.
     */
    private static final String CURRENT_PERSON_QUERY = """
            {
              currentPerson {
                id
                full_name
                profile_photo
                home_lc {
                  id
                  name
                  tag
                  parent {
                    id
                    name
                  }
                }
                current_positions {
                  title
                  role { name }
                  office { id name tag }
                }
              }
            }
            """;

    /**
     * Authoritative EXPA numeric MC office ID → ISO-3166-1 alpha-2 map.
     * Built from the official AIESEC office list (List_of_Office_IDs.xlsx).
     * Only MC-type rows are included; LC ids are deliberately absent.
     */
    private static final Map<String, String> MC_OFFICE_ISO;

    static {
        MC_OFFICE_ISO = new HashMap<>(160);
        // Asia-Pacific
        MC_OFFICE_ISO.put("4",    "MM"); // Myanmar
        MC_OFFICE_ISO.put("55",   "LA"); // Laos
        MC_OFFICE_ISO.put("112",  "NP"); // Nepal
        MC_OFFICE_ISO.put("305",  "KH"); // Cambodia
        MC_OFFICE_ISO.put("409",  "MN"); // Mongolia
        MC_OFFICE_ISO.put("495",  "IR"); // Iran
        MC_OFFICE_ISO.put("504",  "VN"); // Vietnam
        MC_OFFICE_ISO.put("572",  "AF"); // Afghanistan
        MC_OFFICE_ISO.put("1539", "ID"); // Indonesia
        MC_OFFICE_ISO.put("1561", "TW"); // Taiwan
        MC_OFFICE_ISO.put("1562", "KR"); // Korea
        MC_OFFICE_ISO.put("1575", "SG"); // Singapore
        MC_OFFICE_ISO.put("1585", "IN"); // India
        MC_OFFICE_ISO.put("1591", "AU"); // Australia
        MC_OFFICE_ISO.put("1594", "HK"); // Hong Kong
        MC_OFFICE_ISO.put("1603", "PK"); // Pakistan
        MC_OFFICE_ISO.put("1604", "PH"); // Philippines
        MC_OFFICE_ISO.put("1607", "TH"); // Thailand
        MC_OFFICE_ISO.put("1611", "MY"); // Malaysia
        MC_OFFICE_ISO.put("1613", "CN"); // Mainland China
        MC_OFFICE_ISO.put("1615", "JP"); // Japan
        MC_OFFICE_ISO.put("1616", "NZ"); // New Zealand
        MC_OFFICE_ISO.put("1623", "LK"); // Sri Lanka
        MC_OFFICE_ISO.put("2010", "BD"); // Bangladesh
        MC_OFFICE_ISO.put("2104", "BT"); // Bhutan
        MC_OFFICE_ISO.put("2105", "MV"); // Maldives
        MC_OFFICE_ISO.put("2240", "FJ"); // Fiji
        // Middle East & North Africa
        MC_OFFICE_ISO.put("56",   "KW"); // Kuwait
        MC_OFFICE_ISO.put("182",  "LB"); // Lebanon
        MC_OFFICE_ISO.put("457",  "DZ"); // Algeria
        MC_OFFICE_ISO.put("477",  "OM"); // Oman
        MC_OFFICE_ISO.put("518",  "BH"); // Bahrain
        MC_OFFICE_ISO.put("529",  "QA"); // Qatar
        MC_OFFICE_ISO.put("530",  "JO"); // Jordan
        MC_OFFICE_ISO.put("1552", "MA"); // Morocco
        MC_OFFICE_ISO.put("1559", "TN"); // Tunisia
        MC_OFFICE_ISO.put("1609", "EG"); // Egypt
        MC_OFFICE_ISO.put("1625", "AE"); // UAE
        MC_OFFICE_ISO.put("2106", "SA"); // Saudi Arabia
        // Sub-Saharan Africa
        MC_OFFICE_ISO.put("78",   "NA"); // Namibia
        MC_OFFICE_ISO.put("180",  "BF"); // Burkina Faso
        MC_OFFICE_ISO.put("219",  "LR"); // Liberia
        MC_OFFICE_ISO.put("459",  "BJ"); // Benin
        MC_OFFICE_ISO.put("476",  "ET"); // Ethiopia
        MC_OFFICE_ISO.put("489",  "MU"); // Mauritius
        MC_OFFICE_ISO.put("499",  "GA"); // Gabon
        MC_OFFICE_ISO.put("506",  "RW"); // Rwanda
        MC_OFFICE_ISO.put("567",  "TZ"); // Tanzania
        MC_OFFICE_ISO.put("1537", "CI"); // Cote d'Ivoire
        MC_OFFICE_ISO.put("1543", "TG"); // Togo
        MC_OFFICE_ISO.put("1545", "ZA"); // South Africa
        MC_OFFICE_ISO.put("1568", "GH"); // Ghana
        MC_OFFICE_ISO.put("1574", "MZ"); // Mozambique
        MC_OFFICE_ISO.put("1578", "NG"); // Nigeria
        MC_OFFICE_ISO.put("1581", "CM"); // Cameroon
        MC_OFFICE_ISO.put("1584", "BW"); // Botswana
        MC_OFFICE_ISO.put("1602", "UG"); // Uganda
        MC_OFFICE_ISO.put("1605", "SN"); // Senegal
        MC_OFFICE_ISO.put("1617", "KE"); // Kenya
        MC_OFFICE_ISO.put("1709", "MW"); // Malawi
        MC_OFFICE_ISO.put("1840", "SC"); // Seychelles
        MC_OFFICE_ISO.put("2117", "NE"); // Niger
        MC_OFFICE_ISO.put("2122", "ZM"); // Zambia
        MC_OFFICE_ISO.put("2417", "ZW"); // Zimbabwe
        MC_OFFICE_ISO.put("2418", "SZ"); // Swaziland
        MC_OFFICE_ISO.put("2420", "SL"); // Sierra Leone
        MC_OFFICE_ISO.put("2428", "MG"); // Madagascar
        MC_OFFICE_ISO.put("2442", "ML"); // Mali
        // Europe
        MC_OFFICE_ISO.put("57",   "ME"); // Montenegro
        MC_OFFICE_ISO.put("79",   "BY"); // Belarus
        MC_OFFICE_ISO.put("133",  "AL"); // Albania
        MC_OFFICE_ISO.put("494",  "KZ"); // Kazakhstan
        MC_OFFICE_ISO.put("531",  "GE"); // Georgia
        MC_OFFICE_ISO.put("536",  "MD"); // Moldova
        MC_OFFICE_ISO.put("537",  "TJ"); // Tajikistan
        MC_OFFICE_ISO.put("539",  "AZ"); // Azerbaijan
        MC_OFFICE_ISO.put("543",  "KG"); // Kyrgyzstan
        MC_OFFICE_ISO.put("1536", "SK"); // Slovakia
        MC_OFFICE_ISO.put("1540", "IE"); // Ireland
        MC_OFFICE_ISO.put("1541", "AM"); // Armenia
        MC_OFFICE_ISO.put("1542", "IT"); // Italy
        MC_OFFICE_ISO.put("1544", "PT"); // Portugal
        MC_OFFICE_ISO.put("1547", "RS"); // Serbia
        MC_OFFICE_ISO.put("1548", "MK"); // North Macedonia
        MC_OFFICE_ISO.put("1549", "HU"); // Hungary
        MC_OFFICE_ISO.put("1550", "IS"); // Iceland
        MC_OFFICE_ISO.put("1555", "GR"); // Greece
        MC_OFFICE_ISO.put("1558", "CH"); // Switzerland
        MC_OFFICE_ISO.put("1560", "RO"); // Romania
        MC_OFFICE_ISO.put("1563", "GB"); // United Kingdom
        MC_OFFICE_ISO.put("1564", "PL"); // Poland
        MC_OFFICE_ISO.put("1565", "EE"); // Estonia
        MC_OFFICE_ISO.put("1570", "CZ"); // Czech Republic
        MC_OFFICE_ISO.put("1573", "NO"); // Norway
        MC_OFFICE_ISO.put("1577", "DK"); // Denmark
        MC_OFFICE_ISO.put("1579", "LV"); // Latvia
        MC_OFFICE_ISO.put("1580", "LT"); // Lithuania
        MC_OFFICE_ISO.put("1587", "SI"); // Slovenia
        MC_OFFICE_ISO.put("1588", "BG"); // Bulgaria
        MC_OFFICE_ISO.put("1590", "BA"); // Bosnia and Herzegovina
        MC_OFFICE_ISO.put("1592", "AT"); // Austria
        MC_OFFICE_ISO.put("1595", "HR"); // Croatia
        MC_OFFICE_ISO.put("1596", "DE"); // Germany
        MC_OFFICE_ISO.put("1597", "FR"); // France
        MC_OFFICE_ISO.put("1598", "NL"); // Netherlands
        MC_OFFICE_ISO.put("1601", "SE"); // Sweden
        MC_OFFICE_ISO.put("1610", "UA"); // Ukraine
        MC_OFFICE_ISO.put("1612", "MT"); // Malta
        MC_OFFICE_ISO.put("1618", "RU"); // Russia
        MC_OFFICE_ISO.put("1619", "ES"); // Spain
        MC_OFFICE_ISO.put("1620", "FI"); // Finland
        MC_OFFICE_ISO.put("1622", "TR"); // Turkey
        MC_OFFICE_ISO.put("1624", "BE"); // Belgium
        MC_OFFICE_ISO.put("2103", "MC"); // Monaco
        MC_OFFICE_ISO.put("2109", "CY"); // Cyprus
        MC_OFFICE_ISO.put("2115", "UZ"); // Uzbekistan
        MC_OFFICE_ISO.put("2121", "LI"); // Liechtenstein
        MC_OFFICE_ISO.put("2249", "AD"); // Andorra
        // Americas
        MC_OFFICE_ISO.put("177",  "PY"); // Paraguay
        MC_OFFICE_ISO.put("178",  "NI"); // Nicaragua
        MC_OFFICE_ISO.put("577",  "CR"); // Costa Rica
        MC_OFFICE_ISO.put("1535", "AR"); // Argentina
        MC_OFFICE_ISO.put("1538", "PR"); // Puerto Rico
        MC_OFFICE_ISO.put("1551", "CO"); // Colombia
        MC_OFFICE_ISO.put("1553", "PE"); // Peru
        MC_OFFICE_ISO.put("1554", "CA"); // Canada
        MC_OFFICE_ISO.put("1556", "GT"); // Guatemala
        MC_OFFICE_ISO.put("1557", "VE"); // Venezuela
        MC_OFFICE_ISO.put("1566", "CL"); // Chile
        MC_OFFICE_ISO.put("1567", "EC"); // Ecuador
        MC_OFFICE_ISO.put("1572", "SV"); // El Salvador
        MC_OFFICE_ISO.put("1582", "PA"); // Panama
        MC_OFFICE_ISO.put("1589", "MX"); // Mexico
        MC_OFFICE_ISO.put("1593", "BO"); // Bolivia
        MC_OFFICE_ISO.put("1599", "DO"); // Dominican Republic
        MC_OFFICE_ISO.put("1606", "BR"); // Brazil
        MC_OFFICE_ISO.put("1614", "UY"); // Uruguay
        MC_OFFICE_ISO.put("1621", "US"); // United States
        MC_OFFICE_ISO.put("2108", "HN"); // Honduras
        MC_OFFICE_ISO.put("2339", "HT"); // Haiti
        MC_OFFICE_ISO.put("2427", "JM"); // Jamaica
        // Caribbean (island MCs with a region parent)
        MC_OFFICE_ISO.put("29",   "CV"); // Cabo Verde
        MC_OFFICE_ISO.put("30",   "BB"); // Barbados
    }

    private final RestClient http;
    private final String graphqlUrl;
    private final Set<String> mcOfficeIds;

    public AiesecGisService(RestClient aiesecRestClient, AppProperties props) {
        this.http        = aiesecRestClient;
        this.graphqlUrl  = props.aiesec().graphqlUrl();
        this.mcOfficeIds = loadMcOfficeIds();
    }

    /** Fetch the logged-in person's full identity from the GIS API. */
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

    /** Detect MCP vs MEMBER from current positions. */
    public Role detectRole(CurrentPersonResponse person) {
        if (person.current_positions() == null) return Role.MEMBER;
        return person.current_positions().stream().anyMatch(this::isMcpPosition)
                ? Role.MCP : Role.MEMBER;
    }

    /**
     * Primary office for display (author entity on posts).
     * For MCPs this is their MC position's office; for members
     * it is the first position's office or null.
     */
    public CurrentPersonResponse.Office primaryOffice(CurrentPersonResponse person) {
        if (person.current_positions() == null) return null;
        return person.current_positions().stream()
                .map(CurrentPersonResponse.Position::office)
                .filter(o -> o != null)
                .findFirst()
                .orElse(null);
    }

    /**
     * Derive the ISO-3166-1 alpha-2 country code for this person.
     *
     * Priority:
     *  1. MCP position office id → MC_OFFICE_ISO lookup
     *  2. home_lc.parent.id      → MC_OFFICE_ISO lookup  (LC member)
     *  3. home_lc.id             → MC_OFFICE_ISO lookup  (fallback)
     *  4. null                   (graceful — globe just won't highlight)
     */
    public String deriveOfficeCode(CurrentPersonResponse person) {
        // 1. Check MCP position office first
        if (person.current_positions() != null) {
            for (var pos : person.current_positions()) {
                if (isMcpPosition(pos) && pos.office() != null) {
                    String code = MC_OFFICE_ISO.get(pos.office().id());
                    if (code != null) return code;
                }
            }
        }
        // 2. home_lc parent (the MC above an LC member)
        if (person.home_lc() != null && person.home_lc().parent() != null) {
            String code = MC_OFFICE_ISO.get(person.home_lc().parent().id());
            if (code != null) return code;
        }
        // 3. home_lc itself (could be an MC-level office)
        if (person.home_lc() != null) {
            String code = MC_OFFICE_ISO.get(person.home_lc().id());
            if (code != null) return code;
        }
        return null;
    }

    /** LC name from home_lc.name; null if not present. */
    public String deriveLcName(CurrentPersonResponse person) {
        if (person.home_lc() == null) return null;
        return person.home_lc().name();
    }

    /**
     * MC name — home_lc.parent.name if the person is in an LC,
     * or home_lc.name if home_lc is itself an MC (tag == "MC").
     */
    public String deriveMcName(CurrentPersonResponse person) {
        if (person.home_lc() == null) return null;
        if (person.home_lc().parent() != null) {
            return person.home_lc().parent().name();
        }
        // home_lc is the MC itself (e.g. for MCPs whose home_lc == their MC)
        if ("MC".equalsIgnoreCase(person.home_lc().tag())) {
            return person.home_lc().name();
        }
        return null;
    }

    // --- internals ---

    private boolean isMcpPosition(CurrentPersonResponse.Position pos) {
        if (pos == null || pos.office() == null || pos.office().id() == null) return false;
        if (!mcOfficeIds.contains(pos.office().id())) return false;
        String role  = pos.role()  != null && pos.role().name()  != null ? pos.role().name().toLowerCase()  : "";
        String title = pos.title() != null                                ? pos.title().toLowerCase() : "";
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
