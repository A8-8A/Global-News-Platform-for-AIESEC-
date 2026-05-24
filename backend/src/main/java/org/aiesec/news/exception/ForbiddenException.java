package org.aiesec.news.exception;

/**
 * Raised when an authenticated user attempts an action their role does
 * not permit (e.g. a MEMBER trying to create a post). Mapped to HTTP 403.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
