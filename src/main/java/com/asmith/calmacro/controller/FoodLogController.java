package com.asmith.calmacro.controller;

import com.asmith.calmacro.dto.FoodLogDTO;
import com.asmith.calmacro.model.FoodItem;
import com.asmith.calmacro.model.FoodLog;
import com.asmith.calmacro.model.Recipe;
import com.asmith.calmacro.model.User;
import com.asmith.calmacro.service.FoodLogService;
import com.asmith.calmacro.service.UserService;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

/**
 * FoodLogController
 * 
 * Controller to manage FoodLog related operations, including logging food consumption, 
 * updating logs, retrieving logs, and calculating totals.
 */

@RestController
@RequestMapping("/api/foodlog")
public class FoodLogController {

    @Autowired
    private FoodLogService foodLogService;

    @Autowired
    private UserService userService;

    //Logs a new FoodLog entry for a specific user, including details about the food item, meal, and water intake
    @PostMapping("/log")
    public ResponseEntity<FoodLog> logFood(@RequestBody FoodLogDTO foodLogDTO) {

        User user = userService.getUserById(foodLogDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FoodLog savedFoodLog = foodLogService.logFood(
                foodLogDTO.getFoodItemId(),
                foodLogDTO.getRecipeId(),
                user,
                foodLogDTO.getQuantity(),
                foodLogDTO.getLogDate(),
                foodLogDTO.getSelectedMeal(),
                foodLogDTO.getSelectedUnit(),
                foodLogDTO.getUnitQuantity(),
                foodLogDTO.getLogTime(),
                foodLogDTO.getWater()
        );
        return ResponseEntity.ok(savedFoodLog);
    }

    // Updates an existing FoodLog entry by modifying quantity, meal, unit, and unit quantity
    @PutMapping("/{foodLogId}/update")
    public ResponseEntity<FoodLog> updateFoodLog(@PathVariable Long foodLogId, @RequestParam BigDecimal quantity, 
    @RequestParam String selectedMeal, @RequestParam String selectedUnit, @RequestParam BigDecimal unitQuantity) {
        FoodLog updatedFoodLog = foodLogService.updateFoodLog(foodLogId, quantity, selectedMeal, selectedUnit, unitQuantity);
        return ResponseEntity.ok(updatedFoodLog);
    }

    // Updates the water intake amount for a specific FoodLog entry
    @PutMapping("/{foodLogId}/water")
    public ResponseEntity<?> updateWaterAmount(@PathVariable Long foodLogId, @RequestBody BigDecimal newWaterAmount) {
        try {
            var updatedFoodLog = foodLogService.updateWaterAmount(foodLogId, newWaterAmount);
            return ResponseEntity.ok(updatedFoodLog);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred while updating the water amount.");
        }
    }

    // Retrieves a list of water logs for a specific user, optionally filtered by date
    @GetMapping("/user/{userId}/logs/water")
    public ResponseEntity<List<FoodLogDTO>> getWaterLogsByUserIdAndDate(@PathVariable Long userId, @RequestParam(required = false) LocalDate date) {
        User user = userService.getUserById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (date == null) {
            date = LocalDate.now();
        }
        List<FoodLogDTO> waterLogs = foodLogService.getWaterLogsByUserAndDate(user, date);
        return ResponseEntity.ok(waterLogs);
    }

    // Retrieves food logs for a specific user, optionally filtered by date, and includes daily totals and meal totals
    @GetMapping("/user/{userId}/logs")
    public ResponseEntity<Map<String, Object>> getFoodLogsByUserIdAndDate(
            @PathVariable Long userId, @RequestParam(required = false) LocalDate date) {
        User user = userService.getUserById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (date == null) {
            date = LocalDate.now();
        }
        List<FoodLogDTO> foodLogs = foodLogService.getFoodLogsByUserIdAndDate(user, date);
        Map<String, BigDecimal> dailyTotals = foodLogService.calculateDailyTotals(user, date);
        Map<String, Map<String, BigDecimal>> dailyTotalsByMeal = foodLogService.calculateDailyTotalsByMeal(user, date);

        Map<String, Object> response = new HashMap<>();
        response.put("foodLogs", foodLogs);
        response.put("dailyTotals", dailyTotals);
        response.put("dailyTotalsByMeal", dailyTotalsByMeal);

        return ResponseEntity.ok(response);
    }

    // Retrieves the FoodItem associated with a specific FoodLog entry using FoodLog ID
    @GetMapping("/{id}/fooditem")
    public ResponseEntity<FoodItem> getFoodItemByFoodLogId(@PathVariable Long id) {
        FoodItem foodItem = foodLogService.getFoodItemByFoodLogId(id);
        return ResponseEntity.ok(foodItem);
    }

    // Retrieves the Recipe associated with a specific FoodLog entry using FoodLog ID
    @GetMapping("/{id}/recipe")
    public ResponseEntity<Recipe> getRecipeByFoodLogId(@PathVariable Long id) {
        Recipe recipe = foodLogService.getRecipeByFoodLogId(id);
        if (recipe != null) {
            return ResponseEntity.ok(recipe);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Retrieves all FoodLog entries associated with a specific FoodItem using FoodItem ID
    @GetMapping("/fooditem/{foodItemId}")
    public ResponseEntity<List<FoodLog>> getFoodLogsByFoodItemId(@PathVariable Long foodItemId) {
        List<FoodLog> foodLogs = foodLogService.getFoodLogsByFoodItemId(foodItemId);
        return ResponseEntity.ok(foodLogs);
    }

    // Calculates the daily totals for a user on a specific date
    @GetMapping("/totals")
    public ResponseEntity<Map<String, BigDecimal>> calculateDailyTotals(@RequestParam Long userId, @RequestParam String date) {
        User user = userService.getUserById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        LocalDate logDate = LocalDate.parse(date);
        return ResponseEntity.ok(foodLogService.calculateDailyTotals(user, logDate));
    }

    // Retrieves FoodLog entries for a user within a specified date range
    @GetMapping("/range")
    public ResponseEntity<List<FoodLog>> getFoodLogsForDateRange(@RequestParam Long userId, @RequestParam String startDate, @RequestParam String endDate) {
        User user = userService.getUserById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return ResponseEntity.ok(foodLogService.getFoodLogsForDateRange(user, start, end));
    }

    // Deletes a specific FoodLog entry by its ID
    @DeleteMapping("/{foodLogId}")
    public ResponseEntity<Void> deleteFoodLog(@PathVariable Long foodLogId) {
        foodLogService.deleteFoodLog(foodLogId);
        return ResponseEntity.noContent().build();
    }
}
