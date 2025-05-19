package com.asmith.calmacro.model;

import jakarta.persistence.*;
import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

/**
 * VerificationToken
 * 
 * Entity representing a verification token used for user account verification processes.
 * The token has an expiration time, after which it is no longer valid.
 */

@Entity
public class VerificationToken {

    private static final int EXPIRATION = 60 * 24; // Token expiration time (in minutes)

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @Temporal(TemporalType.TIMESTAMP)
    private Date expiryDate;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    
    // Default constructor
    public VerificationToken() {
    }

    // Constructs a verification token for the specified user.
    public VerificationToken(User user) {
        this.user = user;
        this.token = UUID.randomUUID().toString();
        this.expiryDate = calculateExpiryDate(EXPIRATION);
    }

    // Calculates the expiry date based on the current time and the given expiration interval in minutes.
    private Date calculateExpiryDate(int expiryTimeInMinutes) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.MINUTE, expiryTimeInMinutes);
        return new Date(cal.getTime().getTime());
    }

    
    // Getters and setters

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }
}