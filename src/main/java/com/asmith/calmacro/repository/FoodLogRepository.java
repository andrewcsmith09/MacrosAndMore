package com.asmith.calmacro.repository;

import com.asmith.calmacro.model.FoodLog;
import com.asmith.calmacro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * FoodLogRepository
 * 
 * Repository interface for accessing and managing FoodLog entries.
 * Provides query methods for retrieving logs by user, date ranges,
 * food item, recipe, and selected meal, as well as deletion methods
 * for food items and recipes.
 */

public interface FoodLogRepository extends JpaRepository<FoodLog, Long> {
    List<FoodLog> findByUserAndLogDate(User user, LocalDate logDate);
    List<FoodLog> findByUserAndLogDateBetween(User user, LocalDate startDate, LocalDate endDate);
    List<FoodLog> findByFoodItemId(Long foodItemId);
    List<FoodLog> findByRecipeId(Long recipeId);
    List<FoodLog> findByUserAndLogDateAndSelectedMeal(User user, LocalDate logDate, String selectedMeal);
    void deleteByFoodItemId(Long foodItemId);
    void deleteByRecipeId(Long recipeId);
}