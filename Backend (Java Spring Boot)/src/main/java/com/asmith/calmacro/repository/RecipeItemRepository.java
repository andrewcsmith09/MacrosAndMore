package com.asmith.calmacro.repository;

import com.asmith.calmacro.model.Recipe;
import com.asmith.calmacro.model.RecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * RecipeItemRepository
 * 
 * Repository interface for managing RecipeItem entities.
 * Provides methods to delete recipe items by associated Recipe or recipe ID.
 */

public interface RecipeItemRepository extends JpaRepository<RecipeItem, Long> {
    void deleteByRecipe(Recipe recipe);
    void deleteByRecipeId(Long recipeId);
}
