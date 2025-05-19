package com.asmith.calmacro.repository;

import com.asmith.calmacro.model.FoodItem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * FoodItemRepository
 * 
 * Repository interface for accessing and managing FoodItem entities.
 * Provides methods for querying food items by name, user ID, and ID,
 * as well as for retrieving recent items and deleting items by user.
 */

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByNameContainingIgnoreCase(String name);
    List<FoodItem> findByUserId(Long userId);
    Optional<FoodItem> findById(long id);
    List<FoodItem> findTop20ByUserIdOrderByIdDesc(Long userId);
    void deleteByUserId(Long userId);
}
