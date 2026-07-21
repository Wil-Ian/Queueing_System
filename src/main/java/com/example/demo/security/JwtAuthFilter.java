package com.example.demo.security;

import com.example.demo.repositories.BlacklistedTokensRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    // Intercepts inbound HTTP requests and authenticates the caller using a Bearer JWT.
    // This is the bridge between the incoming token and Spring Security's context.
    private final JwtUtil util;
    private final BlacklistedTokensRepository blacklistedTokensRepository;

    public JwtAuthFilter(JwtUtil util, BlacklistedTokensRepository blacklistedTokensRepository) {
        this.util = util;
        this.blacklistedTokensRepository = blacklistedTokensRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Read the Authorization header and expect a Bearer token for protected routes.
        String authHeader = request.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Verify the token signature and expiration before trusting it.
            if(util.isTokenValid(token)) {
                String jti = util.extractJti(token);

                // Reject tokens that were explicitly logged out or invalidated earlier.
                if(!blacklistedTokensRepository.existsByJti(jti)) {
                    String email = util.extractEmail(token);
                    String role = util.extractRole(token);

                    // Build an authenticated principal for Spring Security based on the token claims.
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}