package com.asmith.calmacro.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * User 
 * 
 * Entity class representing a User with authentication, profile, 
 * and extensive nutritional goals and tracking data.
 */

@Entity
public class User { 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    private String firstName;
    
    private String lastName;
    
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean verified = false; 

    @Column(nullable = false)
    private boolean initialLogin = false; 

    private String resetCode;
    private LocalDateTime codeExpiry;
    private LocalDate accountCreated;
    private Integer loginStreak;
    private LocalDate lastCheckedDate;
    private String lastTotals;

    private LocalDate metCalorieGoal;
    private LocalDate metCalMacGoal;
    private LocalDate metWaterGoal;
    private LocalDate metFiberGoal;
    private LocalDate metAllGoals;
    private Integer metCalorieNum;
    private Integer metCalMacNum;
    private Integer metWaterNum;
    private Integer metFiberNum;
    private Integer metAllNum;

    private Integer dailyCalorieGoal;
    private Integer dailyProteinGoal;
    private Integer dailyCarbsGoal;
    private Integer dailyFatGoal;
    private Integer totalSugars;
    private Integer addedSugars;
    private Integer fiber;
    private Integer calcium;
    private Integer iron;
    private Integer sodium;
    private Integer vitaminA;
    private Integer vitaminC;
    private Integer vitaminD;
    private Integer cholesterol;
    private Integer transFat;
    private Integer saturatedFat;
    private Integer polyunsaturatedFat;
    private Integer monounsaturatedFat;
    private Integer potassium;
    private Integer water;

    
    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public boolean isInitialLogin() {
        return initialLogin;
    }

    public void setInitialLogin(boolean initialLogin) {
        this.initialLogin = initialLogin;
    }

    public String getResetCode() {
        return resetCode;
    }

    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }

    public LocalDateTime getCodeExpiry() {
        return codeExpiry;
    }

    public void setCodeExpiry(LocalDateTime codeExpiry) {
        this.codeExpiry = codeExpiry;
    }

    public LocalDate getAccountCreated() {
        return accountCreated;
    }

    public void setAccountCreated(LocalDate accountCreated) {
        this.accountCreated = accountCreated;
    }

    public Integer getLoginStreak() {
        return loginStreak;
    }

    public void setLoginStreak(Integer loginStreak) {
        this.loginStreak = loginStreak;
    }

    public LocalDate getLastCheckedDate() {
        return lastCheckedDate;
    }

    public void setLastCheckedDate(LocalDate lastCheckedDate) {
        this.lastCheckedDate = lastCheckedDate;
    }

    public String getLastTotals() {
        return lastTotals;
    }

    public void setLastTotals(String lastTotals) {
        this.lastTotals = lastTotals;
    }

    public LocalDate getMetCalorieGoal() {
        return metCalorieGoal;
    }

    public void setMetCalorieGoal(LocalDate metCalorieGoal) {
        this.metCalorieGoal = metCalorieGoal;
    }

    public LocalDate getMetCalMacGoal() {
        return metCalMacGoal;
    }

    public void setMetCalMacGoal(LocalDate metCalMacGoal) {
        this.metCalMacGoal = metCalMacGoal;
    }

    public LocalDate getMetWaterGoal() {
        return metWaterGoal;
    }

    public void setMetWaterGoal(LocalDate metWaterGoal) {
        this.metWaterGoal = metWaterGoal;
    }

    public LocalDate getMetFiberGoal() {
        return metFiberGoal;
    }

    public void setMetFiberGoal(LocalDate metFiberGoal) {
        this.metFiberGoal = metFiberGoal;
    }

    public LocalDate getMetAllGoals() {
        return metAllGoals;
    }

    public void setMetAllGoals(LocalDate metAllGoals) {
        this.metAllGoals = metAllGoals;
    }

    public Integer getMetCalorieNum() {
        return metCalorieNum;
    }

    public void setMetCalorieNum(Integer metCalorieNum) {
        this.metCalorieNum = metCalorieNum;
    }

    public Integer getMetCalMacNum() {
        return metCalMacNum;
    }

    public void setMetCalMacNum(Integer metCalMacNum) {
        this.metCalMacNum = metCalMacNum;
    }

    public Integer getMetWaterNum() {
        return metWaterNum;
    }

    public void setMetWaterNum(Integer metWaterNum) {
        this.metWaterNum = metWaterNum;
    }

    public Integer getMetFiberNum() {
        return metFiberNum;
    }

    public void setMetFiberNum(Integer metFiberNUm) {
        this.metFiberNum = metFiberNUm;
    }

    public Integer getMetAllNum() {
        return metAllNum;
    }

    public void setMetAllNum(Integer metAllNum) {
        this.metAllNum = metAllNum;
    }

    public Integer getDailyCalorieGoal() {
        return dailyCalorieGoal;
    }

    public void setDailyCalorieGoal(Integer dailyCalorieGoal) {
        this.dailyCalorieGoal = dailyCalorieGoal;
    }

    public Integer getDailyProteinGoal() {
        return dailyProteinGoal;
    }

    public void setDailyProteinGoal(Integer dailyProteinGoal) {
        this.dailyProteinGoal = dailyProteinGoal;
    }

    public Integer getDailyCarbsGoal() {
        return dailyCarbsGoal;
    }

    public void setDailyCarbsGoal(Integer dailyCarbsGoal) {
        this.dailyCarbsGoal = dailyCarbsGoal;
    }

    public Integer getDailyFatGoal() {
        return dailyFatGoal;
    }

    public void setDailyFatGoal(Integer dailyFatGoal) {
        this.dailyFatGoal = dailyFatGoal;
    }

    public Integer getTotalSugars() {
        return totalSugars;
    }

    public void setTotalSugars(Integer totalSugars) {
        this.totalSugars = totalSugars;
    }

    public Integer getAddedSugars() {
        return addedSugars;
    }

    public void setAddedSugars(Integer addedSugars) {
        this.addedSugars = addedSugars;
    }

    public Integer getFiber() {
        return fiber;
    }

    public void setFiber(Integer fiber) {
        this.fiber = fiber;
    }

    public Integer getCalcium() {
        return calcium;
    }

    public void setCalcium(Integer calcium) {
        this.calcium = calcium;
    }

    public Integer getIron() {
        return iron;
    }

    public void setIron(Integer iron) {
        this.iron = iron;
    }

    public Integer getSodium() {
        return sodium;
    }

    public void setSodium(Integer sodium) {
        this.sodium = sodium;
    }

    public Integer getVitaminA() {
        return vitaminA;
    }

    public void setVitaminA(Integer vitaminA) {
        this.vitaminA = vitaminA;
    }

    public Integer getVitaminC() {
        return vitaminC;
    }

    public void setVitaminC(Integer vitaminC) {
        this.vitaminC = vitaminC;
    }

    public Integer getVitaminD() {
        return vitaminD;
    }

    public void setVitaminD(Integer vitaminD) {
        this.vitaminD = vitaminD;
    }

    public Integer getCholesterol() {
        return cholesterol;
    }

    public void setCholesterol(Integer cholesterol) {
        this.cholesterol = cholesterol;
    }

    public Integer getTransFat() {
        return transFat;
    }

    public void setTransFat(Integer transFat) {
        this.transFat = transFat;
    }

    public Integer getSaturatedFat() {
        return saturatedFat;
    }

    public void setSaturatedFat(Integer saturatedFat) {
        this.saturatedFat = saturatedFat;
    }

    public Integer getPolyunsaturatedFat() {
        return polyunsaturatedFat;
    }

    public void setPolyunsaturatedFat(Integer polyunsaturatedFat) {
        this.polyunsaturatedFat = polyunsaturatedFat;
    }

    public Integer getMonounsaturatedFat() {
        return monounsaturatedFat;
    }

    public void setMonounsaturatedFat(Integer monounsaturatedFat) {
        this.monounsaturatedFat = monounsaturatedFat;
    }

    public Integer getPotassium() {
        return potassium;
    }

    public void setPotassium(Integer potassium) {
        this.potassium = potassium;
    }

    public Integer getWater() {
        return water;
    }

    public void setWater(Integer water) {
        this.water = water;
    }
}
