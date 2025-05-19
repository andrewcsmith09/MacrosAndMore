package com.asmith.calmacro.service;

import com.asmith.calmacro.repository.RecipeRepository;
import com.asmith.calmacro.repository.FoodItemRepository;
import com.asmith.calmacro.repository.FoodLogRepository;
import com.asmith.calmacro.repository.RecipeItemRepository;
import com.asmith.calmacro.dto.RecipeDTO;
import com.asmith.calmacro.dto.RecipeItemDTO;
import com.asmith.calmacro.model.FoodItem;
import com.asmith.calmacro.model.Recipe;
import com.asmith.calmacro.model.RecipeItem;
import com.asmith.calmacro.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;  
import java.util.Optional;

/**
 * RecipeService
 * 
 * This service handles CRUD operations related to recipes, including adding, updating,
 * deleting, and retrieving recipes. It also supports adding/removing recipe items and
 * recalculating nutritional information based on the recipe's items.
 */

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private RecipeItemRepository recipeItemRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private FoodLogRepository foodLogRepository;
    
    // Adds a new recipe to the system
    @Transactional
    public Recipe addRecipe(RecipeDTO recipeDTO) {
        return saveRecipe(new Recipe(), recipeDTO);
    }

    // Updates an existing recipe by its ID
    @Transactional
    public Recipe updateRecipe(Long recipeId, RecipeDTO recipeDTO) {
        Recipe existingRecipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with ID: " + recipeId));

        // Clear existing recipe items and delete them from the database
        existingRecipe.getRecipeItems().clear();
        recipeItemRepository.deleteByRecipe(existingRecipe);

        return saveRecipe(existingRecipe, recipeDTO);
    }

    // Reverts a recipe to its original state from the given DTO
    @Transactional
    public Recipe revertRecipe(Long recipeId, RecipeDTO recipeDTO) {
        Recipe existingRecipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with ID: " + recipeId));

        // Update recipe details from the original recipe data
        existingRecipe.setUserId(recipeDTO.getUserId());
        existingRecipe.setRecipeName(recipeDTO.getRecipeName());
        existingRecipe.setDirection(recipeDTO.getDirection());
        existingRecipe.setServingSize(recipeDTO.getServingSize());
        existingRecipe.setState(recipeDTO.getState());

        // Create a new list of RecipeItem objects
        List<RecipeItem> newRecipeItems = new ArrayList<>();
        if (recipeDTO.getRecipeItems() != null) {
            for (RecipeItemDTO itemDTO : recipeDTO.getRecipeItems()) {
                RecipeItem recipeItem = new RecipeItem();
                recipeItem.setFoodItemId(itemDTO.getFoodItemId());
                recipeItem.setFoodName(itemDTO.getFoodName());
                recipeItem.setQuantity(itemDTO.getQuantity());
                recipeItem.setUnit(itemDTO.getUnit());
                recipeItem.setUnitQuantity(itemDTO.getUnitQuantity());
                newRecipeItems.add(recipeItem);
            }
        }

        // Set the new recipe items  and save the recipe
        existingRecipe.setRecipeItems(newRecipeItems);
        return recipeRepository.save(existingRecipe);
    }

    // Adds a new recipe item (ingredient) to an existing recipe
    @Transactional
    public Recipe addRecipeItem(Long recipeId, RecipeItemDTO itemDTO) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with ID: " + recipeId));

        // Create the RecipeItem and add it to the recipe
        RecipeItem recipeItem = new RecipeItem();
        recipeItem.setFoodItemId(itemDTO.getFoodItemId());
        recipeItem.setFoodName(itemDTO.getFoodName());
        recipeItem.setQuantity(itemDTO.getQuantity());
        recipeItem.setUnit(itemDTO.getUnit());
        recipeItem.setUnitQuantity(itemDTO.getUnitQuantity());
        recipeItem.setRecipe(recipe);

        recipeItemRepository.save(recipeItem);
        recipe.getRecipeItems().add(recipeItem);

        // Update the recipe's nutritional values based on the new item
        FoodItem foodItem = foodItemRepository.findById(itemDTO.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem not found"));

        recipe.setTotalWeight(recipe.getTotalWeight().add(itemDTO.getQuantity()));
        recipe.setCalories(recipe.getCalories().add(foodItem.getCalories().multiply(itemDTO.getQuantity())));
        recipe.setCarbs(recipe.getCarbs().add(foodItem.getCarbs().multiply(itemDTO.getQuantity())));
        recipe.setFat(recipe.getFat().add(foodItem.getFat().multiply(itemDTO.getQuantity())));
        recipe.setProtein(recipe.getProtein().add(foodItem.getProtein().multiply(itemDTO.getQuantity())));
        recipe.setAddedSugars(recipe.getAddedSugars().add(foodItem.getAddedSugars().multiply(itemDTO.getQuantity())));
        recipe.setTotalSugars(recipe.getTotalSugars().add(foodItem.getTotalSugars().multiply(itemDTO.getQuantity())));
        recipe.setTransFat(recipe.getTransFat().add(foodItem.getTransFat().multiply(itemDTO.getQuantity())));
        recipe.setSaturatedFat(recipe.getSaturatedFat().add(foodItem.getSaturatedFat().multiply(itemDTO.getQuantity())));
        recipe.setPolyunsaturatedFat(recipe.getPolyunsaturatedFat().add(foodItem.getPolyunsaturatedFat().multiply(itemDTO.getQuantity())));
        recipe.setMonounsaturatedFat(recipe.getMonounsaturatedFat().add(foodItem.getMonounsaturatedFat().multiply(itemDTO.getQuantity())));
        recipe.setCholesterol(recipe.getCholesterol().add(foodItem.getCholesterol().multiply(itemDTO.getQuantity())));
        recipe.setFiber(recipe.getFiber().add(foodItem.getFiber().multiply(itemDTO.getQuantity())));
        recipe.setCalcium(recipe.getCalcium().add(foodItem.getCalcium().multiply(itemDTO.getQuantity())));
        recipe.setIron(recipe.getIron().add(foodItem.getIron().multiply(itemDTO.getQuantity())));
        recipe.setSodium(recipe.getSodium().add(foodItem.getSodium().multiply(itemDTO.getQuantity())));
        recipe.setPotassium(recipe.getPotassium().add(foodItem.getPotassium().multiply(itemDTO.getQuantity())));
        recipe.setVitaminA(recipe.getVitaminA().add(foodItem.getVitaminA().multiply(itemDTO.getQuantity())));
        recipe.setVitaminC(recipe.getVitaminC().add(foodItem.getVitaminC().multiply(itemDTO.getQuantity())));
        recipe.setVitaminD(recipe.getVitaminD().add(foodItem.getVitaminD().multiply(itemDTO.getQuantity())));

        return recipeRepository.save(recipe);
    }

    // Helper method to save the recipe and its associated recipe items, updating the nutritional values
    private Recipe saveRecipe(Recipe recipe, RecipeDTO recipeDTO) {
        // Set basic recipe properties from the DTO to the recipe object
        recipe.setUserId(recipeDTO.getUserId());
        recipe.setRecipeName(recipeDTO.getRecipeName());
        recipe.setDirection(recipeDTO.getDirection());
        recipe.setState(recipeDTO.getState());
    
        // Initialize nutritional values and recipe items
        List<RecipeItem> recipeItems = new ArrayList<>(); // List to hold the recipe items
        BigDecimal totalWeight = BigDecimal.ZERO;
        BigDecimal totalCalories = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalAddedSugars = BigDecimal.ZERO;
        BigDecimal totalTotalSugars = BigDecimal.ZERO;
        BigDecimal totalTransFat = BigDecimal.ZERO;
        BigDecimal totalSaturatedFat = BigDecimal.ZERO;
        BigDecimal totalPolyunsaturatedFat = BigDecimal.ZERO;
        BigDecimal totalMonounsaturatedFat = BigDecimal.ZERO;
        BigDecimal totalCholesterol = BigDecimal.ZERO;
        BigDecimal totalFiber = BigDecimal.ZERO;
        BigDecimal totalCalcium = BigDecimal.ZERO;
        BigDecimal totalIron = BigDecimal.ZERO;
        BigDecimal totalSodium = BigDecimal.ZERO;
        BigDecimal totalPotassium = BigDecimal.ZERO;
        BigDecimal totalVitaminA = BigDecimal.ZERO;
        BigDecimal totalVitaminC = BigDecimal.ZERO;
        BigDecimal totalVitaminD = BigDecimal.ZERO;
    
        // Process each recipe item in the DTO
        if (recipeDTO.getRecipeItems() != null) {
            // Loop through each RecipeItemDTO in the provided DTO
            for (RecipeItemDTO itemDTO : recipeDTO.getRecipeItems()) {
                // Create a new RecipeItem for each item in the DTO
                RecipeItem recipeItem = new RecipeItem();
                recipeItem.setFoodItemId(itemDTO.getFoodItemId());
                recipeItem.setFoodName(itemDTO.getFoodName());
                recipeItem.setQuantity(itemDTO.getQuantity());
                recipeItem.setUnit(itemDTO.getUnit());
                recipeItem.setUnitQuantity(itemDTO.getUnitQuantity());
                recipeItem.setRecipe(recipe);
                recipeItems.add(recipeItem);
    
                // Retrieve the corresponding FoodItem from the repository based on FoodItem ID
                FoodItem foodItem = foodItemRepository.findById(itemDTO.getFoodItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("FoodItem not found"));

                // Accumulate the nutritional values based on the quantity of the current RecipeItem
                totalWeight = totalWeight.add(itemDTO.getQuantity());
                totalCalories = totalCalories.add(foodItem.getCalories().multiply(itemDTO.getQuantity()));
                totalCarbs = totalCarbs.add(foodItem.getCarbs().multiply(itemDTO.getQuantity()));
                totalFat = totalFat.add(foodItem.getFat().multiply(itemDTO.getQuantity()));
                totalProtein = totalProtein.add(foodItem.getProtein().multiply(itemDTO.getQuantity()));
                totalAddedSugars = totalAddedSugars.add(foodItem.getAddedSugars().multiply(itemDTO.getQuantity()));
                totalTotalSugars = totalTotalSugars.add(foodItem.getTotalSugars().multiply(itemDTO.getQuantity()));
                totalTransFat = totalTransFat.add(foodItem.getTransFat().multiply(itemDTO.getQuantity()));
                totalSaturatedFat = totalSaturatedFat.add(foodItem.getSaturatedFat().multiply(itemDTO.getQuantity()));
                totalPolyunsaturatedFat = totalPolyunsaturatedFat.add(foodItem.getPolyunsaturatedFat().multiply(itemDTO.getQuantity()));
                totalMonounsaturatedFat = totalMonounsaturatedFat.add(foodItem.getMonounsaturatedFat().multiply(itemDTO.getQuantity()));
                totalCholesterol = totalCholesterol.add(foodItem.getCholesterol().multiply(itemDTO.getQuantity()));
                totalFiber = totalFiber.add(foodItem.getFiber().multiply(itemDTO.getQuantity()));
                totalCalcium = totalCalcium.add(foodItem.getCalcium().multiply(itemDTO.getQuantity()));
                totalIron = totalIron.add(foodItem.getIron().multiply(itemDTO.getQuantity()));
                totalSodium = totalSodium.add(foodItem.getSodium().multiply(itemDTO.getQuantity()));
                totalPotassium = totalPotassium.add(foodItem.getPotassium().multiply(itemDTO.getQuantity()));
                totalVitaminA = totalVitaminA.add(foodItem.getVitaminA().multiply(itemDTO.getQuantity()));
                totalVitaminC = totalVitaminC.add(foodItem.getVitaminC().multiply(itemDTO.getQuantity()));
                totalVitaminD = totalVitaminD.add(foodItem.getVitaminD().multiply(itemDTO.getQuantity()));
            }
        }
        
        // Update the recipe's nutritional values based on the totals
        recipe.setTotalWeight(totalWeight);
        recipe.setRecipeItems(recipeItems);
        recipe.setCalories(totalCalories);
        recipe.setCarbs(totalCarbs);
        recipe.setFat(totalFat);
        recipe.setProtein(totalProtein);
        recipe.setAddedSugars(totalAddedSugars);
        recipe.setTotalSugars(totalTotalSugars);
        recipe.setTransFat(totalTransFat);
        recipe.setSaturatedFat(totalSaturatedFat);
        recipe.setPolyunsaturatedFat(totalPolyunsaturatedFat);
        recipe.setMonounsaturatedFat(totalMonounsaturatedFat);
        recipe.setCholesterol(totalCholesterol);
        recipe.setFiber(totalFiber);
        recipe.setCalcium(totalCalcium);
        recipe.setIron(totalIron);
        recipe.setSodium(totalSodium);
        recipe.setPotassium(totalPotassium);
        recipe.setVitaminA(totalVitaminA);
        recipe.setVitaminC(totalVitaminC);
        recipe.setVitaminD(totalVitaminD);
    
        // Save the recipe and return the saved object
        return recipeRepository.save(recipe);
    }

    // Retrieves a recipe by its ID
    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }

    // Retrieves a list of recipes for a specific user based on their user ID
    public List<Recipe> getRecipesByUserId(Long userId) {
        return recipeRepository.findByUserId(userId);
    }

    // Retrieves a list of recipes by recipe name and user ID, ignoring case
    public List<Recipe> getRecipesByRecipeNameAndUserId(String recipeName, Long userId) { 
        return recipeRepository.findByRecipeNameContainingIgnoreCaseAndUserId(recipeName, userId);
    }

    // Retrieves the first 20 recipes for a user, ordered by recipe ID in descending order
    public List<Recipe> getFirst20RecipesForUser(Long userId) {
        return recipeRepository.findTop20ByUserIdOrderByIdDesc(userId);
    }

    // Deletes a recipe by its ID, including any associated food logs
    @Transactional
    public void deleteRecipe(Long recipeId) {
        // Delete food logs containing recipe
        foodLogRepository.deleteByRecipeId(recipeId);

        // Then delete recipe items and recipe
        recipeRepository.deleteById(recipeId);
    }

    // Removes a recipe item from a recipe by its item ID and recalculates the recipe's nutritional values
    @Transactional
    public Recipe removeRecipeItem(Long recipeId, Long recipeItemId) {
        // Find the recipe by ID, throw exception if not found
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with ID: " + recipeId));

        // Find the recipe item by ID, throw exception if not found
        RecipeItem recipeItem = recipeItemRepository.findById(recipeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("RecipeItem not found with ID: " + recipeItemId));

        // Remove the RecipeItem from the recipe
        recipe.getRecipeItems().remove(recipeItem);
        recipeItemRepository.delete(recipeItem);

        // Recalculate recipe nutritional values
        recalculateRecipeNutritionalValues(recipe);

        // Save the updated recipe
        return recipeRepository.save(recipe);
    }

    // Helper method to recalculate the nutritional values of a recipe based on its recipe items
    private void recalculateRecipeNutritionalValues(Recipe recipe) {
        // Initialize variables to store the total nutritional values
        BigDecimal totalWeight = BigDecimal.ZERO;
        BigDecimal totalCalories = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalAddedSugars = BigDecimal.ZERO;
        BigDecimal totalTotalSugars = BigDecimal.ZERO;
        BigDecimal totalTransFat = BigDecimal.ZERO;
        BigDecimal totalSaturatedFat = BigDecimal.ZERO;
        BigDecimal totalPolyunsaturatedFat = BigDecimal.ZERO;
        BigDecimal totalMonounsaturatedFat = BigDecimal.ZERO;
        BigDecimal totalCholesterol = BigDecimal.ZERO;
        BigDecimal totalFiber = BigDecimal.ZERO;
        BigDecimal totalCalcium = BigDecimal.ZERO;
        BigDecimal totalIron = BigDecimal.ZERO;
        BigDecimal totalSodium = BigDecimal.ZERO;
        BigDecimal totalPotassium = BigDecimal.ZERO;
        BigDecimal totalVitaminA = BigDecimal.ZERO;
        BigDecimal totalVitaminC = BigDecimal.ZERO;
        BigDecimal totalVitaminD = BigDecimal.ZERO;

        // Loop through each recipe item in the recipe
        for (RecipeItem item : recipe.getRecipeItems()) {
            // Retrieve the food item based on the food item ID of the recipe item
            FoodItem foodItem = foodItemRepository.findById(item.getFoodItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("FoodItem not found"));

            // Update the nutritional values based on the quantity of the food item in the recipe
            totalWeight = totalWeight.add(item.getQuantity());
            totalCalories = totalCalories.add(foodItem.getCalories().multiply(item.getQuantity()));
            totalCarbs = totalCarbs.add(foodItem.getCarbs().multiply(item.getQuantity()));
            totalFat = totalFat.add(foodItem.getFat().multiply(item.getQuantity()));
            totalProtein = totalProtein.add(foodItem.getProtein().multiply(item.getQuantity()));
            totalAddedSugars = totalAddedSugars.add(foodItem.getAddedSugars().multiply(item.getQuantity()));
            totalTotalSugars = totalTotalSugars.add(foodItem.getTotalSugars().multiply(item.getQuantity()));
            totalTransFat = totalTransFat.add(foodItem.getTransFat().multiply(item.getQuantity()));
            totalSaturatedFat = totalSaturatedFat.add(foodItem.getSaturatedFat().multiply(item.getQuantity()));
            totalPolyunsaturatedFat = totalPolyunsaturatedFat.add(foodItem.getPolyunsaturatedFat().multiply(item.getQuantity()));
            totalMonounsaturatedFat = totalMonounsaturatedFat.add(foodItem.getMonounsaturatedFat().multiply(item.getQuantity()));
            totalCholesterol = totalCholesterol.add(foodItem.getCholesterol().multiply(item.getQuantity()));
            totalFiber = totalFiber.add(foodItem.getFiber().multiply(item.getQuantity()));
            totalCalcium = totalCalcium.add(foodItem.getCalcium().multiply(item.getQuantity()));
            totalIron = totalIron.add(foodItem.getIron().multiply(item.getQuantity()));
            totalSodium = totalSodium.add(foodItem.getSodium().multiply(item.getQuantity()));
            totalPotassium = totalPotassium.add(foodItem.getPotassium().multiply(item.getQuantity()));
            totalVitaminA = totalVitaminA.add(foodItem.getVitaminA().multiply(item.getQuantity()));
            totalVitaminC = totalVitaminC.add(foodItem.getVitaminC().multiply(item.getQuantity()));
            totalVitaminD = totalVitaminD.add(foodItem.getVitaminD().multiply(item.getQuantity()));
        }

        // Update the recipe's nutritional values based on the totals
        recipe.setTotalWeight(totalWeight);
        recipe.setCalories(totalCalories);
        recipe.setCarbs(totalCarbs);
        recipe.setFat(totalFat);
        recipe.setProtein(totalProtein);
        recipe.setAddedSugars(totalAddedSugars);
        recipe.setTotalSugars(totalTotalSugars);
        recipe.setTransFat(totalTransFat);
        recipe.setSaturatedFat(totalSaturatedFat);
        recipe.setPolyunsaturatedFat(totalPolyunsaturatedFat);
        recipe.setMonounsaturatedFat(totalMonounsaturatedFat);
        recipe.setCholesterol(totalCholesterol);
        recipe.setFiber(totalFiber);
        recipe.setCalcium(totalCalcium);
        recipe.setIron(totalIron);
        recipe.setSodium(totalSodium);
        recipe.setPotassium(totalPotassium);
        recipe.setVitaminA(totalVitaminA);
        recipe.setVitaminC(totalVitaminC);
        recipe.setVitaminD(totalVitaminD);
    }

    // Finds a recipe by its ID and throws an exception if not found
    public Recipe findById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with ID: " + id));
    }
    
    // Saves a recipe and returns the saved recipe object
    public Recipe save(Recipe recipe) {
        return recipeRepository.save(recipe);
    }
}
