package com.asmith.calmacro.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

/**
 * RecipeItem
 * 
 * Entity class representing an individual item (ingredient) within a Recipe,
 * including its quantity, unit, and reference to the parent Recipe.
 */

@Entity
public class RecipeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recipeItemId;
    @ManyToOne
    @JoinColumn(name = "recipe_id", nullable = false)
    @JsonBackReference
    private Recipe recipe;
    private Long foodItemId;
    private String foodName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitQuantity;
    
    
    // Getters and setters

    public Long getRecipeItemId() {
        return recipeItemId;
    }
    
    public void setRecipeItemId(Long recipeItemId) {
        this.recipeItemId = recipeItemId;
    }
    
    public Recipe getRecipe() {
        return recipe;
    }
    
    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }
    
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