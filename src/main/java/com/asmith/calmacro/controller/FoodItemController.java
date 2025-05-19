package com.asmith.calmacro.controller;

import com.asmith.calmacro.model.FoodItem;
import com.asmith.calmacro.service.FoodItemService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * FoodItemController
 * 
 * Controller for managing FoodItems, including add, update, delete, and search operations.
 */

@RestController
@RequestMapping("/api/food")
public class FoodItemController {
    
    @Autowired
    private FoodItemService foodItemService;

    // Adds a new FoodItem
    @PostMapping("/add")
    public ResponseEntity<FoodItem> addFoodItem(@RequestBody FoodItem foodItem) {
        return ResponseEntity.ok(foodItemService.addFoodItem(foodItem));
    }

    // Retrieves a FoodItem by its ID
    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodItemById(@PathVariable Long id) {
        Optional<FoodItem> optionalFoodItem = foodItemService.getFoodItemById(id);
    
        if (optionalFoodItem.isPresent()) {
            return ResponseEntity.ok(optionalFoodItem.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Searches for a FoodItem by name
    @GetMapping("/search")
    public List<FoodItem> getFoodItemByName(@RequestParam String name) {
        return foodItemService.getFoodItemByName(name);
    }

    // Retrieves FoodItems for a specific user
    @GetMapping("/user/{userId}")
    public List<FoodItem> getFoodItemsByUserId(@PathVariable Long userId) {
        return foodItemService.getFoodItemsByUserId(userId);
    }

    // Retrieves the first 20 FoodItems for a specific user
    @GetMapping("/first20/user/{userId}")
    public ResponseEntity<List<FoodItem>> getFirst20FoodItemsForUser(@PathVariable Long userId) {
        List<FoodItem> foodItems = foodItemService.getFirst20FoodItemsForUser(userId);
        return ResponseEntity.ok(foodItems);
    }

    // Update a FoodItem's details
    @PutMapping("/update/{id}")
    public ResponseEntity<FoodItem> updateFoodItemDetails(@PathVariable Long id, @RequestBody FoodItem foodItem) {
        foodItem.setId(id); 
        FoodItem updatedFoodItem = foodItemService.updateFoodItemDetails(foodItem);
        return ResponseEntity.ok(updatedFoodItem);
    }

    // Deletes a FoodItem by its ID
    @DeleteMapping("/{foodItemId}")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long foodItemId) {
        foodItemService.deleteFoodItem(foodItemId);
        return ResponseEntity.noContent().build();
    }
}
