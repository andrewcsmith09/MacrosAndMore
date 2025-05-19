package com.asmith.calmacro.service;

import com.asmith.calmacro.repository.RecipeItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * RecipeItemService
 * 
 * This service handles operations related to recipe items.
 * It provides functionality to delete recipe items by their associated recipe ID.
 */

@Service
public class RecipeItemService {

    @Autowired
    private RecipeItemRepository recipeItemRepository;

    // Deletes all recipe items associated with a specific recipe ID
    public void deleteRecipeItemsByRecipeId(Long recipeId) {
        recipeItemRepository.deleteByRecipeId(recipeId);
    }
}
