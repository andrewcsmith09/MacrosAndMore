package com.asmith.calmacro.service;

import com.asmith.calmacro.model.FoodItem;
import com.asmith.calmacro.repository.FoodItemRepository;
import com.asmith.calmacro.repository.FoodLogRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * FoodItemService
 * 
 * Service class responsible for handling business logic related to food items.
 * This includes creating, retrieving, updating, and deleting food items, as well as
 * performing keyword-based search and user-specific filtering.
 */

@Service
public class FoodItemService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private FoodLogRepository foodLogRepository;

    // Saves a new food item to the repository
    public FoodItem addFoodItem(FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }

    // Retrieves a food item by its ID
    public Optional<FoodItem> getFoodItemById(Long id) {
        return foodItemRepository.findById(id);
    }

    // Performs a keyword-based case-insensitive search on food names
    public List<FoodItem> getFoodItemByName(String name) {
        // Trim the input name and split it into keywords
        String[] keywords = name.trim().toLowerCase().split("\\s+"); // Split by spaces
    
        return foodItemRepository.findAll() // Fetch all food items
            .stream()
            .filter(foodItem -> matchesSearchCriteria(foodItem.getName(), keywords))
            .collect(Collectors.toList());
    }
    
    // Checks if the food name contains all keywords (case-insensitive)
    private boolean matchesSearchCriteria(String foodName, String[] keywords) {
        // Convert foodName to lowercase for case-insensitive comparison
        String lowerCaseFoodName = foodName.toLowerCase();
    
        // Check if all keywords are present in the food name
        for (String keyword : keywords) {
            if (!keyword.isEmpty() && !lowerCaseFoodName.contains(keyword)) {
                return false; // If any keyword is missing, return false
            }
        }
        return true; // All keywords are present
    }   
    
    // Retrieves all food items created by a specific user
    public List<FoodItem> getFoodItemsByUserId(Long userId) { 
        return foodItemRepository.findByUserId(userId);
    }

    // Retrieves the 20 most recently added food items for a specific user
    public List<FoodItem> getFirst20FoodItemsForUser(Long userId) {
        return foodItemRepository.findTop20ByUserIdOrderByIdDesc(userId);
    }

    // Updates the fields of an existing food item
    public FoodItem updateFoodItemDetails(FoodItem foodItem) {
        // Fetch the existing food item from the database
        Optional<FoodItem> existingFoodItemOptional = foodItemRepository.findById(foodItem.getId());
        if (existingFoodItemOptional.isPresent()) {
            FoodItem existingFoodItem = existingFoodItemOptional.get();
            
            // Update the food item's details
            existingFoodItem.setName(foodItem.getName());
            existingFoodItem.setCalories(foodItem.getCalories());
            existingFoodItem.setProtein(foodItem.getProtein());
            existingFoodItem.setCarbs(foodItem.getCarbs());
            existingFoodItem.setFat(foodItem.getFat());
            existingFoodItem.setOriginalServingSize(foodItem.getOriginalServingSize());
            existingFoodItem.setServingSize(foodItem.getServingSize());
            existingFoodItem.setServingSizeUnit(foodItem.getServingSizeUnit());
            existingFoodItem.setServingText(foodItem.getServingText());
            existingFoodItem.setTotalSugars(foodItem.getTotalSugars());
            existingFoodItem.setFiber(foodItem.getFiber());
            existingFoodItem.setCalcium(foodItem.getCalcium());
            existingFoodItem.setIron(foodItem.getIron());
            existingFoodItem.setSodium(foodItem.getSodium());
            existingFoodItem.setVitaminA(foodItem.getVitaminA());
            existingFoodItem.setVitaminC(foodItem.getVitaminC());
            existingFoodItem.setCholesterol(foodItem.getCholesterol());
            existingFoodItem.setTransFat(foodItem.getTransFat());
            existingFoodItem.setSaturatedFat(foodItem.getSaturatedFat());
            existingFoodItem.setPolyunsaturatedFat(foodItem.getPolyunsaturatedFat());
            existingFoodItem.setMonounsaturatedFat(foodItem.getMonounsaturatedFat());
            existingFoodItem.setPotassium(foodItem.getPotassium());
            existingFoodItem.setAddedSugars(foodItem.getAddedSugars());
            existingFoodItem.setVitaminD(foodItem.getVitaminD());
            
            // Save the updated food item object
            return foodItemRepository.save(existingFoodItem);
        } else {
            // Handle if the food item does not exist
            throw new IllegalArgumentException("Food item not found");
        }
    }    

    // Deletes a food item and its associated food log entries
    @Transactional
    public void deleteFoodItem(Long foodItemId) {
        // First delete any associated food log entries
        foodLogRepository.deleteByFoodItemId(foodItemId);

        // Then delete the food item itself
        foodItemRepository.deleteById(foodItemId);
    }
}
