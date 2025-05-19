package com.asmith.calmacro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * FoodLogDTO
 * 
 * Data Transfer Object for logging a single food entry for a user.
 * Contains nutritional data and time/date information.
 */

public class FoodLogDTO {
    private Long id;
    private Long userId;
    private Long foodItemId;
    private String foodItemName;
    private Long recipeId;
    private String recipeName;
    private BigDecimal quantity;
    private LocalDate logDate;
    private BigDecimal calories;
    private BigDecimal protein;
    private BigDecimal carbs;
    private BigDecimal fat;
    private BigDecimal addedSugars;
    private BigDecimal totalSugars;
    private BigDecimal transFat;
    private BigDecimal saturatedFat;
    private BigDecimal polyunsaturatedFat;
    private BigDecimal monounsaturatedFat;
    private BigDecimal cholesterol;
    private BigDecimal fiber;
    private BigDecimal calcium;
    private BigDecimal iron;
    private BigDecimal sodium;
    private BigDecimal potassium;
    private BigDecimal vitaminA;
    private BigDecimal vitaminC;
    private BigDecimal vitaminD;
    private String selectedMeal;
    private String selectedUnit;
    private BigDecimal unitQuantity;
    private LocalTime logTime;
    private BigDecimal water;


    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }

    public String getFoodItemName() {
        return foodItemName;
    }

    public void setFoodItemName(String foodItemName) {
        this.foodItemName = foodItemName;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public BigDecimal getCalories() {
        return calories;
    }

    public void setCalories(BigDecimal calories) {
        this.calories = calories;
    }

    public BigDecimal getProtein() {
        return protein;
    }

    public void setProtein(BigDecimal protein) {
        this.protein = protein;
    }

    public BigDecimal getCarbs() {
        return carbs;
    }

    public void setCarbs(BigDecimal carbs) {
        this.carbs = carbs;
    }

    public BigDecimal getFat() {
        return fat;
    }

    public void setFat(BigDecimal fat) {
        this.fat = fat;
    }

    public BigDecimal getAddedSugars() {
        return addedSugars;
    }

    public void setAddedSugars(BigDecimal addedSugars) {
        this.addedSugars = addedSugars;
    }

    public BigDecimal getTotalSugars() {
        return totalSugars;
    }

    public void setTotalSugars(BigDecimal totalSugars) {
        this.totalSugars = totalSugars;
    }

    public BigDecimal getTransFat() {
        return transFat;
    }

    public void setTransFat(BigDecimal transFat) {
        this.transFat = transFat;
    }

    public BigDecimal getSaturatedFat() {
        return saturatedFat;
    }

    public void setSaturatedFat(BigDecimal saturatedFat) {
        this.saturatedFat = saturatedFat;
    }

    public BigDecimal getPolyunsaturatedFat() {
        return polyunsaturatedFat;
    }

    public void setPolyunsaturatedFat(BigDecimal polyunsaturatedFat) {
        this.polyunsaturatedFat = polyunsaturatedFat;
    }

    public BigDecimal getMonounsaturatedFat() {
        return monounsaturatedFat;
    }

    public void setMonounsaturatedFat(BigDecimal monounsaturatedFat) {
        this.monounsaturatedFat = monounsaturatedFat;
    }

    public BigDecimal getCholesterol() {
        return cholesterol;
    }

    public void setCholesterol(BigDecimal cholesterol) {
        this.cholesterol = cholesterol;
    }

    public BigDecimal getFiber() {
        return fiber;
    }

    public void setFiber(BigDecimal fiber) {
        this.fiber = fiber;
    }

    public BigDecimal getCalcium() {
        return calcium;
    }

    public void setCalcium(BigDecimal calcium) {
        this.calcium = calcium;
    }

    public BigDecimal getIron() {
        return iron;
    }

    public void setIron(BigDecimal iron) {
        this.iron = iron;
    }

    public BigDecimal getSodium() {
        return sodium;
    }

    public void setSodium(BigDecimal sodium) {
        this.sodium = sodium;
    }

    public BigDecimal getPotassium() {
        return potassium;
    }

    public void setPotassium(BigDecimal potassium) {
        this.potassium = potassium;
    }

    public BigDecimal getVitaminA() {
        return vitaminA;
    }

    public void setVitaminA(BigDecimal vitaminA) {
        this.vitaminA = vitaminA;
    }

    public BigDecimal getVitaminC() {
        return vitaminC;
    }

    public void setVitaminC(BigDecimal vitaminC) {
        this.vitaminC = vitaminC;
    }

    public BigDecimal getVitaminD() {
        return vitaminD;
    }

    public void setVitaminD(BigDecimal vitaminD) {
        this.vitaminD = vitaminD;
    }

    public String getSelectedMeal() {
        return selectedMeal;
    }

    public void setSelectedMeal(String selectedMeal) {
        this.selectedMeal = selectedMeal;
    }

    public String getSelectedUnit() {
        return selectedUnit;
    }

    public void setSelectedUnit(String selectedUnit) {
        this.selectedUnit = selectedUnit;
    }

    public BigDecimal getUnitQuantity() {
        return unitQuantity;
    }

    public void setUnitQuantity(BigDecimal unitQuantity) {
        this.unitQuantity = unitQuantity;
    }
    public LocalTime getLogTime() {
        return logTime;
    }

    public void setLogTime(LocalTime logTime) {
        this.logTime = logTime;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public String getRecipeName() {
        return recipeName;
    }

    public void setRecipeName(String recipeName) {
        this.recipeName = recipeName;
    }

    public BigDecimal getWater() {
        return water;
    }

    public void setWater(BigDecimal water) {
        this.water = water;
    }

    @Override
    public String toString() {
        return "FoodLogDTO{" +
                "userId=" + userId +
                ", foodItemId=" + foodItemId +
                ", foodItemName" + foodItemName +
                ", recipeId" + recipeId +
                ", recipeName" + recipeName +
                ", quantity=" + quantity +
                ", logDate=" + logDate +
                ", calories=" + calories +
                ", protein=" + protein +
                ", carbs=" + carbs +
                ", fat=" + fat +
                ", totalSugars=" + totalSugars +
                ", addedSugars=" + addedSugars +
                ", transFat=" + transFat +
                ", saturatedFat=" + saturatedFat +
                ", polyunsaturatedFat=" + polyunsaturatedFat +
                ", monounsaturatedFat=" + monounsaturatedFat +
                ", cholesterol=" + cholesterol +
                ", fiber=" + fiber +
                ", calcium=" + calcium +
                ", iron=" + iron +
                ", sodium" + sodium +
                ", potassium=" + potassium +
                ", vitaminA=" + vitaminA +
                ", vitaminC=" + vitaminC +
                ", vitaminD=" + vitaminD +
                ", logTime=" + logTime +
                '}';
    }
}
