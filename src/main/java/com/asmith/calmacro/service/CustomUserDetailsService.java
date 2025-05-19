package com.asmith.calmacro.service;

import com.asmith.calmacro.model.User;
import com.asmith.calmacro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

/**
 * CustomUserDetailsService
 * 
 * Custom implementation of Spring Security's UserDetailsService.
 * This service loads user-specific data from the database
 * to support authentication using Spring Security.
 */

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Attempt to retrieve user by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        
        // Return a Spring Security-compatible UserDetails object
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(), 
            user.getPasswordHash(), 
            new ArrayList<>());
    }
}
