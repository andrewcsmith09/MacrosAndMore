package com.asmith.calmacro.repository;

import com.asmith.calmacro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * UserRepository
 * 
 * Repository interface for managing User entities.
 * Provides methods for user lookup, existence checks, and custom deletion of related food logs.
 */

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<User> findById(Long id);
    User findByResetCode(String resetCode);

    // Deletes all FoodLog entries associated with the specified user ID.
    @Transactional
    @Modifying
    @Query("DELETE FROM FoodLog f WHERE f.user.id = :userId")
    void deleteFoodLogsByUserId(Long userId);
}