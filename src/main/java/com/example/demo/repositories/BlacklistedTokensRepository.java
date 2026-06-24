package com.example.demo.repositories;

import com.example.demo.models.BlacklistedTokens;
import org.springframework.data.jpa.repository.JpaRepository;

// The type after the model is the primary key
public interface BlacklistedTokensRepository extends JpaRepository<BlacklistedTokens, String> {
    boolean existsByJti(String jti);
}
