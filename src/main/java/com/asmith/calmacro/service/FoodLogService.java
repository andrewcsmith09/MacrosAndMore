package com.asmith.calmacro.service;

import com.asmith.calmacro.dto.FoodLogDTO;
import com.asmith.calmacro.model.FoodItem;
import com.asmith.calmacro.model.FoodLog;
import com.asmith.calmacro.model.Recipe;
import com.asmith.calmacro.model.User;
import com.asmith.calmacro.repository.FoodItemRepository;
import com.asmith.calmacro.repository.RecipeRepository;
import com.asmith.calmacro.repository.FoodLogRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service; 

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * FoodLogService
 * 
 * This service provides core logic for managing food log entries. It allows users to log food items
 * or recipes, retrieve logs for a specific date, and calculate total nutritional values, either overall
 * or by meal type. 
 */

@Service
public class FoodLogService {

    @Autowired
    private FoodLogRepository foodLogRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    // Logs a food item or recipe for a user with nutritional and metadata details
    public FoodLog logFood(Long foodItemId, Long recipeId, User user, BigDecimal quantity, 
                           LocalDate logDate, String selectedMeal, String selectedUnit, 
                           BigDecimal unitQuantity, LocalTime logTime, BigDecimal water) {
        FoodLog foodLog = new FoodLog();

        // Determine whether to log a food item or a recipe
        if (foodItemId != null) {
            // Fetch the food item from the repository
            FoodItem foodItem = foodItemRepository.findById(foodItemId)
                    .orElseThrow(() -> new EntityNotFoundException("FoodItem not found"));
            foodLog.setFoodItem(foodItem);
        } else if (recipeId != null) {
            // Fetch the recipe from the repository
            Recipe recipe = recipeRepository.findById(recipeId)
                    .orElseThrow(() -> new EntityNotFoundException("Recipe not found"));
            foodLog.setRecipe(recipe);
        }

        // Set the remaining log metadata
        foodLog.setUser(user);
        foodLog.setQuantity(quantity);
        foodLog.setLogDate(logDate);
        foodLog.setSelectedMeal(selectedMeal);
        foodLog.setSelectedUnit(selectedUnit);
        foodLog.setUnitQuantity(unitQuantity);
        foodLog.setLogTime(logTime);
        foodLog.setWater(water);
        
        // Save and return the food log
        FoodLog savedFoodLog = foodLogRepository.save(foodLog);
        return savedFoodLog;
    }

    // Retrieves all food logs for a user on a specific date and maps them to DTOs
    public List<FoodLogDTO> getFoodLogsByUserIdAndDate(User user, LocalDate date) {
        List<FoodLog> foodLogs = foodLogRepository.findByUserAndLogDate(user, date);
        return foodLogs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Calculates total daily nutritional totals for a user on a specific date
    public Map<String, BigDecimal> calculateDailyTotals(User user, LocalDate date) {
        List<FoodLog> foodLogs = foodLogRepository.findByUserAndLogDate(user, date);
        Map<String, BigDecimal> totals = new HashMap<>();

         // List of nutrients to calculate totals for
        List<String> nutrients = List.of("calories", "protein", "carbs", "fat", "totalSugars", "addedSugars",
                "transFat", "saturatedFat", "polyunsaturatedFat", "monounsaturatedFat", "cholesterol",
                "fiber", "calcium", "iron", "sodium", "potassium", "vitaminA", "vitaminC", "vitaminD", "water");
    
        // Initialize all nutrient totals to zero
        for (String nutrient : nutrients) {
            totals.put(nutrient, BigDecimal.ZERO);
        }
        totals.put("water", BigDecimal.ZERO);
    
        // Aggregate totals across all food logs
        for (FoodLog foodLog : foodLogs) {
            BigDecimal quantity = new BigDecimal(foodLog.getQuantity().toString());
            if (foodLog.getFoodItem() != null) {
                updateTotals(totals, foodLog.getFoodItem(), quantity);
            } else if (foodLog.getRecipe() != null) {
                updateTotals(totals, foodLog.getRecipe(), quantity);
            }
            totals.put("water", totals.get("water").add(foodLog.getWater() != null ? foodLog.getWater() : BigDecimal.ZERO));
        }
    
        return totals;
    }   

    // Calculates daily nutrient totals grouped by meal type
    public Map<String, Map<String, BigDecimal>> calculateDailyTotalsByMeal(User user, LocalDate date) {
        List<String> mealTypes = List.of("Breakfast", "Lunch", "Dinner", "Snack");
    
        // Initialize a map to hold totals for each meal type
        Map<String, Map<String, BigDecimal>> mealTotals = new HashMap<>();
    
        // Define the nutrients to track
        List<String> nutrients = List.of("calories", "protein", "carbs", "fat", "totalSugars", "addedSugars",
                "transFat", "saturatedFat", "polyunsaturatedFat", "monounsaturatedFat", "cholesterol",
                "fiber", "calcium", "iron", "sodium", "potassium", "vitaminA", "vitaminC", "vitaminD", "water");
    
        // Initialize totals for each meal type
        for (String mealType : mealTypes) {
            Map<String, BigDecimal> totals = new HashMap<>();
            for (String nutrient : nutrients) {
                totals.put(nutrient, BigDecimal.ZERO);
            }
            totals.put("water", BigDecimal.ZERO);
            mealTotals.put(mealType, totals);
        }
    
        // Calculate totals for each meal type
        for (String mealType : mealTypes) {
            List<FoodLog> foodLogs = foodLogRepository.findByUserAndLogDateAndSelectedMeal(user, date, mealType);
    
            Map<String, BigDecimal> totals = mealTotals.get(mealType);
    
            for (FoodLog foodLog : foodLogs) {
                BigDecimal quantity = new BigDecimal(foodLog.getQuantity().toString());
                if (foodLog.getFoodItem() != null) {
                    updateTotals(totals, foodLog.getFoodItem(), quantity);
                } else if (foodLog.getRecipe() != null) {
                    updateTotals(totals, foodLog.getRecipe(), quantity);
                }
                totals.put("water", totals.get("water").add(foodLog.getWater() != null ? foodLog.getWater() : BigDecimal.ZERO));
            }
    
            // Update the mealTotals map with calculated totals for the current mealType
            mealTotals.put(mealType, totals);
        }
    
        return mealTotals;
    }
    
    // Updates a totals map with nutrient values from a FoodItem or Recipe
    private void updateTotals(Map<String, BigDecimal> totals, Object item, BigDecimal quantity) {
        // Common nutrient fields are applied similarly whether item is FoodItem or Recipe
        if (item instanceof FoodItem) {
            FoodItem foodItem = (FoodItem) item;
            totals.put("calories", totals.get("calories").add(foodItem.getCalories().multiply(quantity)));
            totals.put("protein", totals.get("protein").add(foodItem.getProtein().multiply(quantity)));
            totals.put("carbs", totals.get("carbs").add(foodItem.getCarbs().multiply(quantity)));
            totals.put("fat", totals.get("fat").add(foodItem.getFat().multiply(quantity)));
            totals.put("totalSugars", totals.get("totalSugars").add(foodItem.getTotalSugars().multiply(quantity)));
            totals.put("addedSugars", totals.get("addedSugars").add(foodItem.getAddedSugars().multiply(quantity)));
            totals.put("transFat", totals.get("transFat").add(foodItem.getTransFat().multiply(quantity)));
            totals.put("saturatedFat", totals.get("saturatedFat").add(foodItem.getSaturatedFat().multiply(quantity)));
            totals.put("polyunsaturatedFat", totals.get("polyunsaturatedFat").add(foodItem.getPolyunsaturatedFat().multiply(quantity)));
            totals.put("monounsaturatedFat", totals.get("monounsaturatedFat").add(foodItem.getMonounsaturatedFat().multiply(quantity)));
            totals.put("cholesterol", totals.get("cholesterol").add(foodItem.getCholesterol().multiply(quantity)));
            totals.put("fiber", totals.get("fiber").add(foodItem.getFiber().multiply(quantity)));
            totals.put("calcium", totals.get("calcium").add(foodItem.getCalcium().multiply(quantity)));
            totals.put("iron", totals.get("iron").add(foodItem.getIron().multiply(quantity)));
            totals.put("sodium", totals.get("sodium").add(foodItem.getSodium().multiply(quantity)));
            totals.put("potassium", totals.get("potassium").add(foodItem.getPotassium().multiply(quantity)));
            totals.put("vitaminA", totals.get("vitaminA").add(foodItem.getVitaminA().multiply(quantity)));
            totals.put("vitaminC", totals.get("vitaminC").add(foodItem.getVitaminC().multiply(quantity)));
            totals.put("vitaminD", totals.get("vitaminD").add(foodItem.getVitaminD().multiply(quantity)));
        } else if (item instanceof Recipe) {
            Recipe recipe = (Recipe) item;
            totals.put("calories", totals.get("calories").add(recipe.getCalories().multiply(quantity)));
            totals.put("protein", totals.get("protein").add(recipe.getProtein().multiply(quantity)));
            totals.put("carbs", totals.get("carbs").add(recipe.getCarbs().multiply(quantity)));
            totals.put("fat", totals.get("fat").add(recipe.getFat().multiply(quantity)));
            totals.put("totalSugars", totals.get("totalSugars").add(recipe.getTotalSugars().multiply(quantity)));
            totals.put("addedSugars", totals.get("addedSugars").add(recipe.getAddedSugars().multiply(quantity)));
            totals.put("transFat", totals.get("transFat").add(recipe.getTransFat().multiply(quantity)));
            totals.put("saturatedFat", totals.get("saturatedFat").add(recipe.getSaturatedFat().multiply(quantity)));
            totals.put("polyunsaturatedFat", totals.get("polyunsaturatedFat").add(recipe.getPolyunsaturatedFat().multiply(quantity)));
            totals.put("monounsaturatedFat", totals.get("monounsaturatedFat").add(recipe.getMonounsaturatedFat().multiply(quantity)));
            totals.put("cholesterol", totals.get("cholesterol").add(recipe.getCholesterol().multiply(quantity)));
            totals.put("fiber", totals.get("fiber").add(recipe.getFiber().multiply(quantity)));
            totals.put("calcium", totals.get("calcium").add(recipe.getCalcium().multiply(quantity)));
            totals.put("iron", totals.get("iron").add(recipe.getIron().multiply(quantity)));
            totals.put("sodium", totals.get("sodium").add(recipe.getSodium().multiply(quantity)));
            totals.put("potassium", totals.get("potassium").add(recipe.getPotassium().multiply(quantity)));
            totals.put("vitaminA", totals.get("vitaminA").add(recipe.getVitaminA().multiply(quantity)));
            totals.put("vitaminC", totals.get("vitaminC").add(recipe.getVitaminC().multiply(quantity)));
            totals.put("vitaminD", totals.get("vitaminD").add(recipe.getVitaminD().multiply(quantity)));
        }
    }   
    
    // Updates a food log's quantity, unit, and meal metadata
    public FoodLog updateFoodLog(Long foodLogId, BigDecimal quantity, String selectedMeal, String selectedUnit, BigDecimal unitQuantity) {
        // Find the FoodLog by ID
        FoodLog foodLog = foodLogRepository.findById(foodLogId)
                .orElseThrow(() -> new EntityNotFoundException("FoodLog not found"));
    
        // Update fields
        foodLog.setQuantity(quantity);
        foodLog.setSelectedMeal(selectedMeal);
        foodLog.setSelectedUnit(selectedUnit);
        foodLog.setUnitQuantity(unitQuantity);
    
        // Save and return the updated FoodLog
        FoodLog updatedFoodLog = foodLogRepository.save(foodLog);
        return updatedFoodLog;
    }

    // Retrieves all logs for a user tagged as "Water" for a specific date
    public List<FoodLogDTO> getWaterLogsByUserAndDate(User user, LocalDate date) {
        List<FoodLog> foodLogs = foodLogRepository.findByUserAndLogDateAndSelectedMeal(user, date, "Water");
        return foodLogs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }    

    // Updates only the water value in a FoodLog entry
    public FoodLog updateWaterAmount(Long foodLogId, BigDecimal newWaterAmount) {
        // Find the FoodLog by ID
        FoodLog foodLog = foodLogRepository.findById(foodLogId)
                .orElseThrow(() -> new EntityNotFoundException("FoodLog not found"));
    
        // Update the water amount
        foodLog.setWater(newWaterAmount);
    
        // Save the updated FoodLog
        FoodLog updatedFoodLog = foodLogRepository.save(foodLog);
            
        return updatedFoodLog;
    }
       
    // Retrieves all food logs for a given user within a specified date range
    public List<FoodLog> getFoodLogsForDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return foodLogRepository.findByUserAndLogDateBetween(user, startDate, endDate);
    }

    // Deletes a food log by ID
    public void deleteFoodLog(Long foodLogId) {
        foodLogRepository.deleteById(foodLogId);
    }

    // Retrieves the FoodItem associated with a specific FoodLog entry
    public FoodItem getFoodItemByFoodLogId(Long foodLogId) {
        FoodLog foodLog = foodLogRepository.findById(foodLogId)
            .orElseThrow(() -> new EntityNotFoundException("FoodLog not found"));
        return foodLog.getFoodItem();
    }

    // Retrieves the Recipe associated with a specific FoodLog entry
    public Recipe getRecipeByFoodLogId(Long foodLogId) {
        FoodLog foodLog = foodLogRepository.findById(foodLogId)
                .orElseThrow(() -> new EntityNotFoundException("FoodLog not found"));
        return foodLog.getRecipe();
    }    

    // Retrieves all food logs that reference a specific food item
    public List<FoodLog> getFoodLogsByFoodItemId(Long foodItemId) {
        return foodLogRepository.findByFoodItemId(foodItemId);
    }

    // Maps FoodLog entity to FoodLogDTO
    private FoodLogDTO mapToDTO(FoodLog foodLog) {
        FoodLogDTO dto = new FoodLogDTO();
        dto.setId(foodLog.getId());
        dto.setUserId(foodLog.getUser().getId());
        dto.setQuantity(foodLog.getQuantity());
        dto.setLogDate(foodLog.getLogDate());
        dto.setLogTime(foodLog.getLogTime());
        dto.setSelectedMeal(foodLog.getSelectedMeal());
        dto.setSelectedUnit(foodLog.getSelectedUnit());
        dto.setUnitQuantity(foodLog.getUnitQuantity());
        dto.setWater(foodLog.getWater());

        if (foodLog.getFoodItem() != null) {
            dto.setFoodItemId(foodLog.getFoodItem().getId());
            dto.setFoodItemName(foodLog.getFoodItem().getName());
            dto.setCalories(foodLog.getFoodItem().getCalories());
            dto.setProtein(foodLog.getFoodItem().getProtein());
            dto.setCarbs(foodLog.getFoodItem().getCarbs());
            dto.setFat(foodLog.getFoodItem().getFat());
            dto.setTotalSugars(foodLog.getFoodItem().getTotalSugars());
            dto.setAddedSugars(foodLog.getFoodItem().getAddedSugars());
            dto.setTransFat(foodLog.getFoodItem().getTransFat());
            dto.setSaturatedFat(foodLog.getFoodItem().getSaturatedFat());
            dto.setPolyunsaturatedFat(foodLog.getFoodItem().getPolyunsaturatedFat());
            dto.setMonounsaturatedFat(foodLog.getFoodItem().getMonounsaturatedFat());
            dto.setCholesterol(foodLog.getFoodItem().getCholesterol());
            dto.setFiber(foodLog.getFoodItem().getFiber());
            dto.setCalcium(foodLog.getFoodItem().getCalcium());
            dto.setIron(foodLog.getFoodItem().getIron());
            dto.setSodium(foodLog.getFoodItem().getSodium());
            dto.setPotassium(foodLog.getFoodItem().getPotassium());
            dto.setVitaminA(foodLog.getFoodItem().getVitaminA());
            dto.setVitaminC(foodLog.getFoodItem().getVitaminC());
            dto.setVitaminD(foodLog.getFoodItem().getVitaminD());
        } else if (foodLog.getRecipe() != null) {
            dto.setRecipeId(foodLog.getRecipe().getId());  
            dto.setFoodItemName(foodLog.getRecipe().getRecipeName());  
            dto.setCalories(foodLog.getRecipe().getCalories());
            dto.setProtein(foodLog.getRecipe().getProtein());
            dto.setCarbs(foodLog.getRecipe().getCarbs());
            dto.setFat(foodLog.getRecipe().getFat());
            dto.setTotalSugars(foodLog.getRecipe().getTotalSugars());
            dto.setAddedSugars(foodLog.getRecipe().getAddedSugars());
            dto.setTransFat(foodLog.getRecipe().getTransFat());
            dto.setSaturatedFat(foodLog.getRecipe().getSaturatedFat());
            dto.setPolyunsaturatedFat(foodLog.getRecipe().getPolyunsaturatedFat());
            dto.setMonounsaturatedFat(foodLog.getRecipe().getMonounsaturatedFat());
            dto.setCholesterol(foodLog.getRecipe().getCholesterol());
            dto.setFiber(foodLog.getRecipe().getFiber());
            dto.setCalcium(foodLog.getRecipe().getCalcium());
            dto.setIron(foodLog.getRecipe().getIron());
            dto.setSodium(foodLog.getRecipe().getSodium());
            dto.setPotassium(foodLog.getRecipe().getPotassium());
            dto.setVitaminA(foodLog.getRecipe().getVitaminA());
            dto.setVitaminC(foodLog.getRecipe().getVitaminC());
            dto.setVitaminD(foodLog.getRecipe().getVitaminD());
        }
        return dto;
    }

}
