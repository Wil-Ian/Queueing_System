package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    // Utility class for creating and validating JWTs used by the authentication flow.
    // The token contains the user's email, role, and a unique identifier for logout handling.
    private SecretKey key;

    @Value("${jwt.secret}")
    private String secretString;

    // Initialize the signing key once the application has loaded its secret configuration.
    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secretString.getBytes());
    }

    // Create an access token that is valid for one hour and includes the user's role.
    public String generateToken(String email, String role) {
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("jti", jti)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
                .signWith(key)
                .compact();
    }

    // Create a longer-lived refresh token so the user can obtain a new access token.
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7))
                .signWith(key)
                .compact();
    }

    // Parse and verify the signed JWT payload before reading its claims.
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public String extractJti(String token) {
        return extractClaims(token).get("jti", String.class);
    }

    // Return true when the token is structurally valid and has not expired.
    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}