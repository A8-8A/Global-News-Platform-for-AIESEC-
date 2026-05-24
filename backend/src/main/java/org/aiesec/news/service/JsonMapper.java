package org.aiesec.news.service;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Shared Jackson ObjectMapper. ObjectMapper is thread-safe once
 * configured, so one shared instance is reused.
 */
final class JsonMapper {

    private static final ObjectMapper INSTANCE = new ObjectMapper();

    private JsonMapper() {
    }

    static ObjectMapper shared() {
        return INSTANCE;
    }
}
