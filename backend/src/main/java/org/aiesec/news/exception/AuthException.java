package org.aiesec.news.exception;

/**
 * Raised when authentication fails - bad OAuth code, AIESEC API error,
 * invalid admin credentials, etc. Mapped to HTTP 401 by the global
 * exception handler.
 */
public class AuthException extends RuntimeException {

    public AuthException(String message) {
        super(message);
    }

    public AuthException(String message, Throwable cause) {
        super(message, cause);
    }
}
