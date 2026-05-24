package org.aiesec.news.domain;

/**
 * Platform roles.
 *
 *  MCP    - Member Committee President. Can create posts (rate-limited).
 *           Derived from AIESEC GIS data: a current_position whose
 *           office.type == "MC" and whose role indicates president.
 *  MEMBER - Any other AIESEC user. Can read the feed, like, comment.
 *  ADMIN  - Platform moderator. NOT an AIESEC user; logs in with a
 *           separate email+password. Moderates content.
 */
public enum Role {
    MCP,
    MEMBER,
    ADMIN
}
