-- =====================================================================
-- V2 - User profile fields + post editorial fields.
--
-- users additions:
--   bio         - free-text self-description (user-editable on profile page)
--   photo_url   - profile photo URL; pre-filled from EXPA profile_photo
--                 at login, overridable via Firebase Storage upload
--   role_title  - human-readable EXPA position title (e.g. "Member
--                 Committee President"), captured at login
--   office_code - ISO-3166-1 alpha-2 code derived from EXPA office id
--                 (e.g. "LB", "BR"); drives globe + flag chips
--   lc_name     - home_lc.name from EXPA (e.g. "AIESEC in Beirut")
--   mc_name     - home_lc.parent.name from EXPA (e.g. "AIESEC in Lebanon")
--
-- posts additions:
--   excerpt     - short standfirst shown on the feed card (from Compose)
--   tag         - editorial category (e.g. CONGRESS, GROWTH)
-- =====================================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS bio         TEXT,
    ADD COLUMN IF NOT EXISTS photo_url   VARCHAR(1024),
    ADD COLUMN IF NOT EXISTS role_title  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS office_code VARCHAR(4),
    ADD COLUMN IF NOT EXISTS lc_name     VARCHAR(255),
    ADD COLUMN IF NOT EXISTS mc_name     VARCHAR(255);

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS excerpt VARCHAR(512),
    ADD COLUMN IF NOT EXISTS tag     VARCHAR(64);
