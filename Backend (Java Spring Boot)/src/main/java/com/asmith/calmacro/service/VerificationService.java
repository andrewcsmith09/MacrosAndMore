package com.asmith.calmacro.service;

import com.asmith.calmacro.repository.VerificationTokenRepository;
import com.asmith.calmacro.repository.UserRepository;
import com.asmith.calmacro.model.User;
import com.asmith.calmacro.model.VerificationToken;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.UUID;
import java.util.Optional;

/**
 * VerificationService
 *
 * This service handles user email verification processes. It is responsible for generating and sending 
 * verification tokens, resending verification emails, and verifying users' email addresses.
 */

@Service
public class VerificationService {

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Generates a verification token for the given user
    public String generateVerificationToken(User user) {
        // Generate a unique UUID token for the user
        String token = UUID.randomUUID().toString();

        // Create a new VerificationToken object and set its properties
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000)); // 24 hours

        // Save the token in the repository
        tokenRepository.save(verificationToken);
        return token;
    }

    // Resends a verification email to a user, if they are not verified yet
    @Transactional
    public ResponseEntity<String> resendVerificationToken(String username) {
        // Look up the user by username
        Optional<User> userOptional = userRepository.findByUsername(username);

        // Check if the user exists and is not already verified
        if (userOptional.isEmpty() || userOptional.get().isVerified()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found or already verified.");
        }

        User user = userOptional.get();

        // Delete any existing verification token for the user
        tokenRepository.deleteByUser(user); 

        // Generate a new token for the user and send the verification email
        String token = generateVerificationToken(user);
        emailService.sendVerificationEmail(user.getUsername(), token);

        return ResponseEntity.ok("Verification email sent successfully.");
    }

    // Verifies a user's email based on the provided token
    public ResponseEntity<String> verifyEmail(String token) {
        // Find the verification token in the repository
        VerificationToken verificationToken = tokenRepository.findByToken(token);

        // Check if the token is invalid or expired
        if (verificationToken == null || verificationToken.getExpiryDate().before(new Date())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token.");
        }

         // Mark the user as verified and save the user object
        User user = verificationToken.getUser();
        user.setVerified(true);
        userRepository.save(user);

        // Delete the token after successful verification
        tokenRepository.delete(verificationToken); 

        return ResponseEntity.ok("Email verified successfully.");
    }
}
