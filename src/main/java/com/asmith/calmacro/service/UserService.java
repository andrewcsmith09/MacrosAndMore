package com.asmith.calmacro.service;

import com.asmith.calmacro.model.User;
import com.asmith.calmacro.model.VerificationToken;
import com.asmith.calmacro.repository.UserRepository;
import com.asmith.calmacro.repository.FoodItemRepository;
import com.asmith.calmacro.repository.RecipeRepository;
import com.asmith.calmacro.repository.VerificationTokenRepository;
import com.asmith.calmacro.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.Date;

/**
 * UserService
 * 
 * This service is responsible for managing user-related operations such as registration,
 * login, password management, user verification, profile update, and deletion.
 * It communicates with several repositories to interact with user data, handle 
 * password encoding, token management, and verification processes.
 */

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil; 

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetService passwordResetService;

    // Registers a new user 
    @Transactional
    public ResponseEntity<String> registerUser(User user) {
        try {
            // Check if username already exists
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
            }

            // Encode password and save user
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
            user.setVerified(false);
            User savedUser = userRepository.save(user);

            // Generate verification token and send email
            String token = generateVerificationToken(savedUser);
            emailService.sendVerificationEmail(savedUser.getUsername(), token);

            return ResponseEntity.ok("User registered successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during registration.");
        }
    }

    // Helper method to generate verification token
    private String generateVerificationToken(User user) {
        VerificationToken verificationToken = new VerificationToken(user);
        tokenRepository.save(verificationToken);
        return verificationToken.getToken();
    }

    // Verifies a user's email using a verification token
    @Transactional
    public String verifyUser(String token) {
        // Fetch the verification token from the repository
        VerificationToken verificationToken = tokenRepository.findByToken(token);

        // Check if the token exists
        if (verificationToken == null) {
            throw new IllegalArgumentException("Invalid verification token.");
        }

        // Check if the token is expired
        if (verificationToken.getExpiryDate().before(new Date())) {
            throw new IllegalArgumentException("Verification token has expired.");
        }

        // Fetch the user linked to the token
        User user = verificationToken.getUser();

        // Check if the user is already verified
        if (user.isVerified()) {
            return "User is already verified.";
        }

        // Mark the user as verified
        user.setVerified(true);
        userRepository.save(user);

        // Optionally delete the token after verification
        tokenRepository.delete(verificationToken);

        return "User verified successfully.";
    }

    // Logs in the user by validating the provided credentials
    public ResponseEntity<String> loginUser(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        // If username doesn't exist, prompt user to create account
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No account registered with this email. Press 'Create Account' to register.");
        }
        
        User user = userOptional.get();
        if (passwordEncoder.matches(password, user.getPasswordHash())) {
            // Check if user has verified account
            if (!user.isVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Please verify your email before logging in.");
            }
            // If username is found and account is verified, login user
            return ResponseEntity.ok("Login successful.");
        }
        // If username is found but password is incorrect, alert user
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect password. Press 'Forgot Password?' if you need to reset your password." );
    }

    // Checks if the provided password matches the stored password for the user
    public ResponseEntity<String> checkPassword(Long id, String password) {
        // Fetch the user by username
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.get();
        
        // Check if the provided password matches the stored password
        if (passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.ok("Password is correct. User is logged in.");
        }
    
        // If password does not match, notify user
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Incorrect password. Press 'Forgot Password?' if you need to reset your password.");
    }    

    // Updates the user's password after verifying the current password
    public ResponseEntity<String> updatePassword(Long userId, String currentPassword, String newPassword) {
        // Retrieve user by user ID
        Optional<User> userOptional = userRepository.findById(userId);
        
        // Check if user exists
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        
        User user = userOptional.get();
        
        // Check if the current password matches the stored password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return ResponseEntity.ok()
                    .body("INCORRECT_CURRENT_PASSWORD");
        }
        
        // Encode the new password and update the user
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok("Password updated successfully.");
    }

    // Requests a password reset for a user
    public ResponseEntity<String> requestPasswordReset(String email) {
        try {
            passwordResetService.initiatePasswordReset(email);
            return ResponseEntity.ok("Password reset email sent.");
        } catch (ResponseStatusException e) {
            // Directly return the status and message from the exception
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }    
   
    // Resets the password using the provided reset code and new password
    public ResponseEntity<String> resetPassword(String code, String newPassword) {
        try {
            passwordResetService.resetPassword(code, newPassword);
            return ResponseEntity.ok("Password has been reset successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }       

    // Generates a JWT token for the given username
    public String generateToken(String username) {
        return jwtUtil.generateToken(username); 
    }

    // Updates the user's profile with the provided details
    public ResponseEntity<String> updateUserProfile(User user) {
        Optional<User> existingUserOptional = userRepository.findById(user.getId());
        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();
    
            // Only update the fields that were sent    
            if (user.getUsername() != null) {
                existingUser.setUsername(user.getUsername());
            }
            if (user.getFirstName() != null) {
                existingUser.setFirstName(user.getFirstName());
            }
            if (user.getLastName() != null) {
                existingUser.setLastName(user.getLastName());
            }
            if (user.isInitialLogin() != false) {
                existingUser.setInitialLogin(user.isInitialLogin());
            }
            if (user.getAccountCreated() != null) {
                existingUser.setAccountCreated(user.getAccountCreated());
            }
            if (user.getLoginStreak() != null) {
                existingUser.setLoginStreak(user.getLoginStreak());
            }
            if (user.getLastCheckedDate() != null) {
                existingUser.setLastCheckedDate(user.getLastCheckedDate());
            }
            if (user.getLastTotals() != null) {
                existingUser.setLastTotals(user.getLastTotals());
            }
            if (user.getMetCalorieGoal() != null) {
                existingUser.setMetCalorieGoal(user.getMetCalorieGoal());
            }
            if (user.getMetCalMacGoal() != null) {
                existingUser.setMetCalMacGoal(user.getMetCalMacGoal());
            }
            if (user.getMetWaterGoal() != null) {
                existingUser.setMetWaterGoal(user.getMetWaterGoal());
            }
            if (user.getMetFiberGoal() != null) {
                existingUser.setMetFiberGoal(user.getMetFiberGoal());
            }
            if (user.getMetAllGoals() != null) {
                existingUser.setMetAllGoals(user.getMetAllGoals());
            }
            if (user.getMetCalorieNum() != null) {
                existingUser.setMetCalorieNum(user.getMetCalorieNum());
            }
            if (user.getMetCalMacNum() != null) {
                existingUser.setMetCalMacNum(user.getMetCalMacNum());
            }
            if (user.getMetWaterNum() != null) {
                existingUser.setMetWaterNum(user.getMetWaterNum());
            }
            if (user.getMetFiberNum() != null) {
                existingUser.setMetFiberNum(user.getMetFiberNum());
            }
            if (user.getMetAllNum() != null) {
                existingUser.setMetAllNum(user.getMetAllNum());
            }
            if (user.getDailyCalorieGoal() != null) {
                existingUser.setDailyCalorieGoal(user.getDailyCalorieGoal());
            }
            if (user.getDailyProteinGoal() != null) {
                existingUser.setDailyProteinGoal(user.getDailyProteinGoal());
            }
            if (user.getDailyCarbsGoal() != null) {
                existingUser.setDailyCarbsGoal(user.getDailyCarbsGoal());
            }
            if (user.getDailyFatGoal() != null) {
                existingUser.setDailyFatGoal(user.getDailyFatGoal());
            }
            if (user.getTotalSugars() != null) {
                existingUser.setTotalSugars(user.getTotalSugars());
            }
            if (user.getAddedSugars() != null) {
                existingUser.setAddedSugars(user.getAddedSugars());
            }
            if (user.getFiber() != null) {
                existingUser.setFiber(user.getFiber());
            }
            if (user.getCalcium() != null) {
                existingUser.setCalcium(user.getCalcium());
            }
            if (user.getIron() != null) {
                existingUser.setIron(user.getIron());
            }
            if (user.getSodium() != null) {
                existingUser.setSodium(user.getSodium());
            }
            if (user.getVitaminA() != null) {
                existingUser.setVitaminA(user.getVitaminA());
            }
            if (user.getVitaminC() != null) {
                existingUser.setVitaminC(user.getVitaminC());
            }
            if (user.getVitaminD() != null) {
                existingUser.setVitaminD(user.getVitaminD());
            }
            if (user.getCholesterol() != null) {
                existingUser.setCholesterol(user.getCholesterol());
            }
            if (user.getTransFat() != null) {
                existingUser.setTransFat(user.getTransFat());
            }
            if (user.getSaturatedFat() != null) {
                existingUser.setSaturatedFat(user.getSaturatedFat());
            }
            if (user.getPolyunsaturatedFat() != null) {
                existingUser.setPolyunsaturatedFat(user.getPolyunsaturatedFat());
            }
            if (user.getMonounsaturatedFat() != null) {
                existingUser.setMonounsaturatedFat(user.getMonounsaturatedFat());
            }
            if (user.getPotassium() != null) {
                existingUser.setPotassium(user.getPotassium());
            }
            if (user.getWater() != null) {
                existingUser.setWater(user.getWater());
            }
    
            // Save updated user
            userRepository.save(existingUser);
            return ResponseEntity.ok("User profile updated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }    
    
    // Retrieves a user by their username
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Retrieves a user by their ID
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    // Deletes the user's account and all associated data 
    @Transactional
    public void deleteUser(Long userId) {
        // Delete food logs
        userRepository.deleteFoodLogsByUserId(userId);

        // Delete recipes
        recipeRepository.deleteByUserId(userId);

        // Delete food items
        foodItemRepository.deleteByUserId(userId);

        // Finally, delete the user
        userRepository.deleteById(userId);
    }
}
