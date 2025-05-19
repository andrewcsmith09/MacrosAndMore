package com.asmith.calmacro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JwtProperties
 * 
 * Configuration properties class for JWT settings. 
 * This class binds to properties prefixed with "jwt" in the application configuration file 
 */

@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    // Secret key used for signing and verifying JWT tokens
    private String secret;

    // Returns the JWT secret key.
    public String getSecret() {
        return secret;
    }

    // Sets the JWT secret key.
    public void setSecret(String secret) {
        this.secret = secret;
    }
}
