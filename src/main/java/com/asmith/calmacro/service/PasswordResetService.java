package com.asmith.calmacro.service;

import com.asmith.calmacro.model.User;
import com.asmith.calmacro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * PasswordResetService
 * 
 * This service handles the logic for initiating and processing password reset requests.
 * It allows users to initiate a password reset using their email, and reset their password 
 * using a verification code sent to their email. The service validates the code, checks its 
 * expiry, and securely updates the user's password.
 */

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Initiates a password reset by generating a reset code and sending it to the user's email
    public void initiatePasswordReset(String email) {
        // Find the user by their email (username)
        User user = userRepository.findByUsername(email).orElse(null);
        
        if (user == null) {
            // If the user doesn't exist, throw a Not Found exception
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
    
        // Generate a random 6-digit reset code
        String code = generateCode();

        // Store the reset code and set expiratiion time to 10 minutes
        user.setResetCode(code);
        user.setCodeExpiry(LocalDateTime.now().plusMinutes(10));

        // Save the user with the new reset code and expiry time
        userRepository.save(user);
    
        // Send the reset code to the user's email
        emailService.sendPasswordResetEmail(user.getUsername(), code);
    }
    
    // Resets the user's password if the provided reset code is valid and not expired
    public void resetPassword(String code, String newPassword) {

        // Find the user by their reset code
        User user = userRepository.findByResetCode(code);

        // Check if the user exists and if the code is expired
        if (user == null || user.getCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired code");
        }

        // Encode the new password and update the user's password
        user.setPasswordHash(passwordEncoder.encode(newPassword)); 

        // Clear the reset code and expiry time after successful password reset
        user.setResetCode(null); 
        user.setCodeExpiry(null); 

        // Save the updated user with the new password
        userRepository.save(user); 
    }

    // Generates a random 6-digit code for resetting user's password
    private String generateCode() {
        // Create a random number generator
        Random random = new Random();

        // Format number as a 6-digit string 
        return String.format("%06d", random.nextInt(1000000));
    }
}
