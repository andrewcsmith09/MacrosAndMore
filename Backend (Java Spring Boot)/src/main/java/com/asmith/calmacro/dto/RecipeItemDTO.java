package com.asmith.calmacro.dto;

import java.math.BigDecimal;

/**
 * RecipeItemDTO
 * 
 * Data Transfer Object representing an individual item in a recipe,
 * including food item ID, name, quantity, and unit information.
 */

public class RecipeItemDTO {

    private Long foodItemId;
    private String foodName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitQuantity;
    

    // Getters and setters
    
    public Long getFoodItemId() {
        return foodItemId;
    }
    
    public void setFoodItemId(Long foodItemId) {
        this.foodItemId = foodItemId;
    }
    
    public BigDecimal getQuantity() {
        return quantity;
    }
    
    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitQuantity() {
        return unitQuantity;
    }

    public void setUnitQuantity(BigDecimal unitQuantity) {
        this.unitQuantity = unitQuantity;
    }
}
