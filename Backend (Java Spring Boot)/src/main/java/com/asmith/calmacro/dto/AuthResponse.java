package com.asmith.calmacro.dto;

import com.asmith.calmacro.model.User;

/**
 * AuthResponse
 * 
 * Data Transfer Object representing the authentication response returned after a successful login.
 * It contains the access token, refresh token, and user information.
 */

public class AuthResponse {
    
    private String accessToken;
    private String refreshToken;
    private User user;

    
    // Getters and setters

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public AuthResponse(String accessToken, String refreshToken, User user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
}
