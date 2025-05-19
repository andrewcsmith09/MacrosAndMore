package com.asmith.calmacro.controller;

import com.asmith.calmacro.dto.RecipeDTO;
import com.asmith.calmacro.dto.RecipeItemDTO;
import com.asmith.calmacro.model.Recipe;
import com.asmith.calmacro.service.RecipeService;
import com.asmith.calmacro.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RecipeController
 * 
 * Controller for managing recipes, including creating, updating, searching, and deleting recipes and recipe items.
 */

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    // Adds a new recipe
    @PostMapping
    public ResponseEntity<Recipe> addRecipe(@RequestBody RecipeDTO recipeDTO) {
        Recipe newRecipe = recipeService.addRecipe(recipeDTO);
        return ResponseEntity.ok(newRecipe);
    }

    // Reverts a recipe to a previous state by updating the recipe with the provided details
    @PutMapping("/{id}/revert")
    public ResponseEntity<Recipe> revertRecipe(@PathVariable Long id, @RequestBody RecipeDTO recipeDTO) {
        Recipe updatedRecipe = recipeService.updateRecipe(id, recipeDTO);
        return ResponseEntity.ok(updatedRecipe);
    }

    // Updates an existing recipe with the provided details
    @PutMapping("/{id}")
    public ResponseEntity<Recipe> updateRecipe(@PathVariable Long id, @RequestBody RecipeDTO recipeDTO) {
        Recipe existingRecipe = recipeService.findById(id);   

        existingRecipe.setRecipeName(recipeDTO.getRecipeName());
        existingRecipe.setDirection(recipeDTO.getDirection());
        existingRecipe.setServingSize(recipeDTO.getServingSize());
        existingRecipe.setState(recipeDTO.getState());
        
        recipeService.save(existingRecipe);
        return ResponseEntity.ok(existingRecipe);
    }

    // Adds a new item (ingredient) to an existing recipe
    @PostMapping("/{recipeId}/items")
    public ResponseEntity<Recipe> addRecipeItem(@PathVariable Long recipeId, @RequestBody RecipeItemDTO itemDTO) {
        Recipe updatedRecipe = recipeService.addRecipeItem(recipeId, itemDTO);
        return ResponseEntity.ok(updatedRecipe);
    }

    // Retrieves a recipe by its ID
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id) {
        Recipe recipe = recipeService.getRecipeById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with ID: " + id));
        return ResponseEntity.ok(recipe);
    }

    // Retrieves all recipes associated with a specific user
    @GetMapping("/user/{userId}")
    public List<Recipe> getRecipesByUserId(@PathVariable Long userId) {
        return recipeService.getRecipesByUserId(userId);
    }

    // Searches for recipes by their name and user ID
    @GetMapping("/search")
    public List<Recipe> getRecipesByRecipeNameAndUserId(@RequestParam String recipeName, @RequestParam Long userId) {
        return recipeService.getRecipesByRecipeNameAndUserId(recipeName, userId);
    }

    // Retrieves the first 20 recipes for a specific user
    @GetMapping("/first20/user/{userId}")
    public ResponseEntity<List<Recipe>> getFirst20RecipesForUser(@PathVariable Long userId) {
        List<Recipe> recipes = recipeService.getFirst20RecipesForUser(userId);
        return ResponseEntity.ok(recipes);
    }

    // Removes an item (ingredient) from a specific recipe
    @DeleteMapping("/{recipeId}/items/{recipeItemId}")
    public ResponseEntity<Void> removeRecipeItem(@PathVariable Long recipeId, @PathVariable Long recipeItemId) {
        recipeService.removeRecipeItem(recipeId, recipeItemId);
        return ResponseEntity.noContent().build();
    }

    // Deletes a specific recipe by its ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
