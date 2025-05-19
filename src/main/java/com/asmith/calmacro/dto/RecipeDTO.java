package com.asmith.calmacro.dto;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/**
 * RecipeDTO
 * 
 * Data Transfer Object representing a custom recipe created by the user.
 * Contains the recipe name, directions, serving size, state, and a list of food items.
 */

public class RecipeDTO {

    @NotNull
    private Long userId;
    @NotEmpty
    private String recipeName;
    private String direction;
    public BigDecimal servingSize;
    private String state;

    private List<RecipeItemDTO> recipeItems;

    
    // Getters and setters

    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getRecipeName() {
        return recipeName;
    }
    
    public void setRecipeName(String recipeName) {
        this.recipeName = recipeName;
    }
    
    public String getDirection() {
        return direction;
    }
    
    public void setDirection(String direction) {
        this.direction = direction;
    }

    public BigDecimal getServingSize() {
        return servingSize;
    }

    public void setServingSize(BigDecimal servingSize) {
        this.servingSize = servingSize;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public List<RecipeItemDTO> getRecipeItems() {
        return recipeItems;
    }

    public void setRecipeItems(List<RecipeItemDTO> recipeItems) {
        this.recipeItems = recipeItems;
    }
}
