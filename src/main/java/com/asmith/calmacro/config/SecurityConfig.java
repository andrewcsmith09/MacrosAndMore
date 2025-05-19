package com.asmith.calmacro.config;

import com.asmith.calmacro.security.JwtFilter;
import com.asmith.calmacro.security.CustomAuthenticationEntryPoint; // Ensure this import exists
import com.asmith.calmacro.service.CustomUserDetailsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig
 * 
 * Configuration class for Spring Security. It sets up authentication and authorization mechanisms,
 * including custom JWT filtering, stateless session management, and permitted endpoints.
 */

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private CustomAuthenticationEntryPoint authenticationEntryPoint;


    /* Defines the security filter chain, including which endpoints are permitted without authentication,
     which require authentication, and how exceptions and sessions are handled. */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless authentication
            .csrf(csrf -> csrf.disable()) 
            // Define which endpoints are publicly accessible and which require authenticatio
            .authorizeHttpRequests(authz -> authz 
                .requestMatchers(
                    "/api/users/login", 
                    "/api/users/register", 
                    "/api/auth/refresh", 
                    "/api/verify-email", 
                    "/api/resend-verification", 
                    "/api/forgot-password", 
                    "/api/reset-password"
                ).permitAll() // Permit these endpoints without authentication
                .anyRequest().authenticated() // All other requests need authentication
            )

            // Handle unauthorized access with a custom entry point
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint) 
            )

             // Set session management to stateless (no session will be created or used by Spring Security)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Add the custom JWT filter before the standard username/password authentication filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Defines the password encoder bean using BCrypt, which will be used to encode and verify user passwords.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); 
    }

    // Configures the authentication manager to use the custom user details service and password encoder.
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);

        authenticationManagerBuilder
            .userDetailsService(customUserDetailsService)
            .passwordEncoder(passwordEncoder());

        return authenticationManagerBuilder.build(); 
    }
}
