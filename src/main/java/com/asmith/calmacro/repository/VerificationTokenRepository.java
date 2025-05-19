package com.asmith.calmacro.repository;

import com.asmith.calmacro.model.User;
import com.asmith.calmacro.model.VerificationToken;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * VerificationTokenRepository
 * 
 * Repository interface for managing VerificationToken entities.
 * Provides methods to retrieve tokens by value and delete tokens associated with a user.
 */

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    VerificationToken findByToken(String token);
    void deleteByUser(User user);
}