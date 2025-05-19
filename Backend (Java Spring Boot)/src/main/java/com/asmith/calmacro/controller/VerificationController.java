package com.asmith.calmacro.controller;

import com.asmith.calmacro.service.UserService;
import com.asmith.calmacro.service.VerificationService;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * VerificationController
 * 
 * Controller that handles user verification operations such as email verification,
 * resending verification tokens, and handling password reset requests.
 */

@RestController
@RequestMapping("/api")
public class VerificationController {

    @Autowired
    private UserService userService;

    @Autowired
    private VerificationService verificationService;

    // Verifies the user's email using a provided token
    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam("token") String token) {
        try {
            userService.verifyUser(token);
            // Redirect to the verify-email page with a success message
            return ResponseEntity
                    .status(HttpStatus.FOUND) 
                    .location(URI.create("https://andrewsmithdevelopment.com/verify-email?status=verified")) // Success
                    .build();
        } catch (IllegalArgumentException e) {
            // Redirect to the verify-email page with an error message
            return ResponseEntity
                    .status(HttpStatus.FOUND)
                    .location(URI.create("https://andrewsmithdevelopment.com/verify-email?status=failed&error=" + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8))) // Failure
                    .build();
        }
    }

    // Resends the email verification token to the user
    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        return verificationService.resendVerificationToken(username);
    }

    // Initiates the password reset process by sending a reset link to the provided email
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        return userService.requestPasswordReset(email);
    }

    // Resets the user's password using a provided reset code and new password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String newPassword = request.get("newPassword");
        
        return userService.resetPassword(code, newPassword);
    }
}


