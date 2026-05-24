-- =====================================================================
-- V1 - Initial schema for the Global AIESEC News Platform.
--
-- Design notes:
--  * All timestamps are timestamptz (UTC). The frontend converts to
--    local time for display. The 7-day posting window is computed in
--    SQL (now() - interval) so it is entirely UTC end-to-end.
--  * The weekly post limit is NOT stored as a counter. It is derived
--    by COUNT(*) over posts in the trailing 7 days - stateless, self
--    -resetting, and immune to counter drift.
-- =====================================================================

-- ---------------------------------------------------------------------
-- users
-- One row per person who has logged in. Two kinds:
--   * AIESEC users (MCP / MEMBER): created on first OAuth login.
--     aiesec_person_id is set; password_hash is NULL.
--   * Admins (ADMIN): created manually / via seeding.
--     password_hash is set; aiesec_person_id is NULL.
-- We never store AIESEC passwords.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role              VARCHAR(16)  NOT NULL CHECK (role IN ('MCP', 'MEMBER', 'ADMIN')),

    -- AIESEC identity (NULL for admins)
    aiesec_person_id  VARCHAR(64)  UNIQUE,
    full_name         VARCHAR(255),
    office_id         VARCHAR(64),
    office_name       VARCHAR(255),

    -- Admin identity (NULL for AIESEC users)
    email             VARCHAR(255) UNIQUE,
    password_hash     VARCHAR(255),

    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    -- Integrity: an AIESEC user must have a person id; an admin must
    -- have email + password. Enforced so neither kind can be malformed.
    CONSTRAINT chk_user_identity CHECK (
        (role IN ('MCP', 'MEMBER') AND aiesec_person_id IS NOT NULL
                                   AND password_hash IS NULL)
        OR
        (role = 'ADMIN' AND email IS NOT NULL
                         AND password_hash IS NOT NULL
                         AND aiesec_person_id IS NULL)
    )
);

-- ---------------------------------------------------------------------
-- posts
-- Created only by MCPs (enforced in the service layer by role).
-- status drives visibility:
--   APPROVED -> visible in the public feed
--   PENDING  -> awaiting admin decision (overflow past weekly limit)
--   REJECTED -> rejected by an admin; visible to the author only
-- ---------------------------------------------------------------------
CREATE TABLE posts (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_id      BIGINT       NOT NULL REFERENCES users(id),
    title          VARCHAR(255) NOT NULL,
    content        TEXT         NOT NULL,
    media_url      VARCHAR(1024),
    status         VARCHAR(16)  NOT NULL DEFAULT 'PENDING'
                                CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Feed query is "approved posts, newest first" - index supports it.
CREATE INDEX idx_posts_status_created ON posts (status, created_at DESC);
-- Weekly-limit query counts an author's recent posts - index supports it.
CREATE INDEX idx_posts_author_created ON posts (author_id, created_at);

-- ---------------------------------------------------------------------
-- comments
-- Any AIESEC user (MCP or MEMBER) may comment on a post.
-- ---------------------------------------------------------------------
CREATE TABLE comments (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id     BIGINT      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id   BIGINT      NOT NULL REFERENCES users(id),
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post ON comments (post_id, created_at);

-- ---------------------------------------------------------------------
-- likes
-- The UNIQUE(post_id, user_id) constraint makes a duplicate like
-- physically impossible - the DB guarantees one like per user per post.
-- ---------------------------------------------------------------------
CREATE TABLE likes (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id     BIGINT      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     BIGINT      NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_like_post_user UNIQUE (post_id, user_id)
);

-- ---------------------------------------------------------------------
-- admin_actions
-- Audit trail. The spec requires every admin action to be logged.
-- target_type / target_id identify what was acted on (post, comment).
-- ---------------------------------------------------------------------
CREATE TABLE admin_actions (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id     BIGINT       NOT NULL REFERENCES users(id),
    action       VARCHAR(32)  NOT NULL,
    target_type  VARCHAR(32)  NOT NULL,
    target_id    BIGINT       NOT NULL,
    detail       TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_actions_created ON admin_actions (created_at DESC);
