package com.asmith.calmacro.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Recipe
 * 
 * Entity class representing a Recipe with nutritional information,
 * preparation details, and associated recipe items (ingredients).
 */
    
@Entity
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String recipeName;
    private String direction;
    private String state;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeItem> recipeItems = new ArrayList<>();

    private BigDecimal calories;
    private BigDecimal protein;
    private BigDecimal carbs;
    private BigDecimal fat;
    private BigDecimal totalWeight;
    private BigDecimal servingSize;
    private String servingSizeUnit; 
    private String servingText;
    private BigDecimal totalSugars;
    private BigDecimal fiber;
    private BigDecimal calcium;
    private BigDecimal iron;
    private BigDecimal sodium;
    private BigDecimal vitaminA;
    private BigDecimal vitaminC;
    private BigDecimal cholesterol;
    private BigDecimal transFat;
    private BigDecimal saturatedFat;
    private BigDecimal polyunsaturatedFat;
    private BigDecimal monounsaturatedFat;
    private BigDecimal potassium;
    private BigDecimal addedSugars;
    private BigDecimal vitaminD;
    
    
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

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
    
    public List<RecipeItem> getRecipeItems() {
        return recipeItems;
    }
   
    public void setRecipeItems(List<RecipeItem> recipeItems) {
        this.recipeItems.clear(); // Clear existing items
        if (recipeItems != null) {
            for (RecipeItem item : recipeItems) {
                item.setRecipe(this); // Maintain the back-reference
                this.recipeItems.add(item); // Add new items
            }
        }
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

    public BigDecimal getServingSize() {
        return servingSize;
    }

    public void setServingSize(BigDecimal servingSize) {
        this.servingSize = servingSize;
    }

    public String getServingSizeUnit() {
        return servingSizeUnit;
    }

    public void setServingSizeUnit(String servingSizeUnit) {
        this.servingSizeUnit = servingSizeUnit;
    }

    public String getServingText() {
        return servingText;
    }

    public void setServingText(String servingText) {
        this.servingText = servingText;
    }

    public BigDecimal getTotalSugars() {
        return totalSugars;
    }

    public void setTotalSugars(BigDecimal totalSugars) {
        this.totalSugars = totalSugars;
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

    public BigDecimal getCholesterol() {
        return cholesterol;
    }

    public void setCholesterol(BigDecimal cholesterol) {
        this.cholesterol = cholesterol;
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
    
    public BigDecimal getPotassium () {
        return potassium;
    }

    public void setPotassium (BigDecimal potassium) {
        this.potassium = potassium;
    }

    public BigDecimal getAddedSugars () {
        return addedSugars;
    }

    public void setAddedSugars (BigDecimal addedSugars) {
        this.addedSugars = addedSugars;
    }

    public BigDecimal getVitaminD() {
        return vitaminD;
    }

    public void setVitaminD(BigDecimal vitaminD) {
        this.vitaminD = vitaminD;
    }

    public BigDecimal getTotalWeight() {
        return totalWeight;
    }

    public void setTotalWeight(BigDecimal totalWeight) {
        this.totalWeight = totalWeight;
    }
}
