package com.asmith.calmacro.repository;

import com.asmith.calmacro.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * RecipeRepository
 * 
 * Repository interface for managing Recipe entities.
 * Provides methods for querying and deleting recipes based on user ID and recipe name.
 */

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByUserId(Long userId);
    List<Recipe> findByRecipeNameContainingIgnoreCaseAndUserId(String recipeName, Long userId);
    List<Recipe> findTop20ByUserIdOrderByIdDesc(Long userId);
    void deleteByUserId(Long userId);
}
