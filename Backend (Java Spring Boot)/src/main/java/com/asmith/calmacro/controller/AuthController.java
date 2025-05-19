package com.asmith.calmacro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.asmith.calmacro.util.JwtUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;

import java.util.HashMap;
import java.util.Map;

/**
 * AuthController
 * 
 * Controller for handling authentication-related operations such as token validation
 * and refreshing access tokens using valid refresh tokens.
 */

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;
    
    // Validates the currently provided JWT token to check if the user is still authenticated
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken() {
        try {
            // Retrieve authentication from the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            // If authentication is null or the user is not authenticated, return an unauthorized status
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("isValid", false, "message", "Token is invalid or expired"));
            }

            // Get the username from the token
            String username = authentication.getName();
            
            // Return a response indicating that the token is valid and include the username
            return ResponseEntity.ok(Map.of("isValid", true, "username", username));

        } catch (Exception e) {
            // If any exception occurs during token validation, return an unauthorized status with an error message
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("isValid", false, "message", "Token validation failed"));
        }
    }

    // Refreshes the access token using a valid refresh token
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody Map<String, String> tokenRequest) {
        String refreshToken = tokenRequest.get("refreshToken");

        try {
            // Check if the refresh token is expired
            if (jwtUtil.isTokenExpired(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token expired or invalid.");
            }

            // Decode the refresh token to get the username
            Claims claims = jwtUtil.decodeToken(refreshToken);
            String username = claims.getSubject();

            // Generate a new access token
            String newAccessToken = jwtUtil.generateToken(username);

            // Generate a new refresh token
            String newRefreshToken = jwtUtil.generateRefreshToken(username);

            // Create a response map containing both tokens
            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken", newAccessToken);
            tokens.put("refreshToken", newRefreshToken);

            // Return the new tokens in the response
            return ResponseEntity.ok(tokens);

        } catch (ExpiredJwtException e) {
            // If the refresh token has expired, return an unauthorized status with an appropriate message
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token expired.");
        } catch (Exception e) {
            // If there is any other error with the refresh token, return an unauthorized status with a generic error message
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token.");
        }
    }
}
