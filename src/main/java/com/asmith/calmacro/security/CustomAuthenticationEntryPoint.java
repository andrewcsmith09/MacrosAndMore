package com.asmith.calmacro.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * CustomAuthenticationEntryPoint
 * 
 * Custom entry point for handling unauthorized access attempts in the Spring Security filter chain.
 * This component is triggered when an unauthenticated user tries to access a secured resource.
 * If the request is marked as "refreshable", it indicates that the token is expired but eligible for refresh,
 * and a specific message is returned. Otherwise, a 401 Unauthorized error is sent.
 */

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationEntryPoint.class);

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        
        // Check if the request is marked as "refreshable" 
        Boolean refreshable = (Boolean) request.getAttribute("refreshable");
        
        if (refreshable != null && refreshable) {
            // Token is expired but eligible for refresh; prompt client to refresh the token
            response.getWriter().write("Token expired, please refresh");
        } else {
            // Token is missing or invalid; log the failure and respond with 401 Unauthorized
            logger.error("Authentication failed: {}", authException.getMessage());

            // Only override if no error code has been set yet
            if (response.getStatus() == HttpServletResponse.SC_OK) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            }
        }
    }
}
