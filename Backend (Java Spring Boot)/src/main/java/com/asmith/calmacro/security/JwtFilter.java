package com.asmith.calmacro.security;

import com.asmith.calmacro.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * JwtFilter
 * 
 * Filter that intercepts all incoming HTTP requests to validate JWT access and refresh tokens.
 *
 * - Skips public endpoints (login, register, password reset, etc.).
 * - Validates the access token and sets the authenticated user in the security context.
 * - If the access token is expired and a valid refresh token is provided, flags the request as "refreshable".
 * - Sends appropriate error responses for invalid or expired tokens.
 */

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    public JwtFilter(UserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");

        // Skip filter for public endpoints
        if (request.getRequestURI().startsWith("/api/users/login") || 
            request.getRequestURI().startsWith("/api/users/register") || 
            request.getRequestURI().startsWith("/api/auth/refresh") ||
            request.getRequestURI().startsWith("/api/verify-email") || 
            request.getRequestURI().startsWith("/api/resend-verification") || 
            request.getRequestURI().startsWith("/api/forgot-password") || 
            request.getRequestURI().startsWith("/api/reset-password")) {
            chain.doFilter(request, response);
            return;
        }

        // Proceed if Authorization header contains a Bearer token
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String jwt = authorizationHeader.substring(7);
            try {
                // Decode and validate access token
                Claims claims = jwtUtil.decodeToken(jwt);
                String username = claims.getSubject();

                // Authenticate only if user is not already authenticated
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    try {
                        // Try to load user details
                        UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                        // Set the authentication in the SecurityContext
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                    } catch (UsernameNotFoundException e) {
                        // Handle user not found (e.g., user deleted)
                        logger.error("User not found: {}", username);
                        response.sendError(HttpServletResponse.SC_NOT_FOUND, "User not found");
                        return; 
                    }
                }
            } catch (ExpiredJwtException e) {
                logger.error("JWT access token expired: {}", e.getMessage());
    
                // Check if the refresh token is expired
                String refreshToken = request.getHeader("Refresh-Token");
                if (refreshToken != null) {
                    try {
                        // Decode the refresh token and check if it's expired
                        Claims refreshClaims = jwtUtil.decodeToken(refreshToken);
                        if (!jwtUtil.isTokenExpired(refreshToken)) {
                            request.setAttribute("refreshable", true); // Only set refreshable if refresh token is valid
                        } else {
                            logger.error("Refresh token expired.");
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Refresh token expired, please log in again.");
                            return; // Stop processing further if refresh token is expired
                        }
                    } catch (ExpiredJwtException refreshExp) {
                        logger.error("Refresh token expired: {}", refreshExp.getMessage());
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Refresh token expired, please log in again.");
                        return; // Stop processing further if refresh token is expired
                    }
                } else {
                    logger.warn("No refresh token provided.");
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Refresh token required.");
                    return;
                }
            } catch (Exception e) {
                logger.error("JWT validation failed: {}", e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT validation failed");
                return;
            }
        } else {
            logger.warn("Authorization header missing or does not start with Bearer");
        }

        // Continue filter chain
        chain.doFilter(request, response);
    }
}
