package com.asmith.calmacro.controller;

import com.asmith.calmacro.model.ContactFormRequest;
import com.asmith.calmacro.model.User;
import com.asmith.calmacro.service.UserService;
import com.asmith.calmacro.util.JwtUtil;
import com.asmith.calmacro.service.EmailService;
import com.asmith.calmacro.dto.AuthResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * UserController
 * 
 * Controller for managing user-related operations including registration, login, password updates, profile updates,
 * and managing contact form submissions.
 */

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    // Registers a new user
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        ResponseEntity<String> response = userService.registerUser(user);
        return response;
    }

    // Logs in a user and returns JWT tokens (access and refresh tokens)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        // Calls the userService to authenticate user credentials
        ResponseEntity<String> response = userService.loginUser(user.getUsername(), user.getPasswordHash());

        // If login is successful, generate JWT tokens
        if (response.getStatusCode() == HttpStatus.OK) {
            String accessToken = jwtUtil.generateToken(user.getUsername()); // Generate access token
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername()); // Generate a refresh token
            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, user)); // Return both tokens
        } else {
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        }
    }

    // Updates a user's password
    @PostMapping("/update-password")
    public ResponseEntity<String> updatePassword(@RequestParam Long userId, @RequestParam String currentPassword, @RequestParam String newPassword) {
        return userService.updatePassword(userId, currentPassword, newPassword);
    }

    // Verifies if the provided password matches the user's current password
    @PostMapping("/check-password")
    public ResponseEntity<String> checkPassword(@RequestParam Long id, @RequestParam String password) {
        return userService.checkPassword(id, password);
    }

    // Handles the submission of a contact form by sending an email
    @PostMapping("/contact-us")
    public ResponseEntity<String> submitContactForm(@RequestBody ContactFormRequest request) {
        emailService.sendContactEmail(request.getEmail(), request.getName(), request.getSubject(), request.getMessage());
        return ResponseEntity.ok("Your message has been sent successfully!");
    }

    // Updates a user's profile information
    @PutMapping("/update")
    public ResponseEntity<String> updateUserProfile(@RequestBody User user) {
        return userService.updateUserProfile(user);
    }

    // Retrieves a user by their username
    @GetMapping("/name/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> userOptional = userService.getUserByUsername(username);
        return userOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Retrieves a user by their user ID
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        Optional<User> userOptional = userService.getUserById(userId);
        return userOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a user by their user ID
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
