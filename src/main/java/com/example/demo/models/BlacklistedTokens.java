package com.example.demo.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedTokens {
    @Id
    private String jti;

    public void setJti(String jti) {
        this.jti = jti;
    }

    public String getJti() {
        return jti;
    }
}
