package com.example.demo.services;

import com.example.demo.exceptions.InvalidOperationException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
public class UserService {

    // Service layer for visitor/user records.
    // These methods handle user creation, duplicate checks, and soft deletion.

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findByIsActiveTrue();
    }

    // Create a new user record and reject duplicate active names.
    public User createUser(User user) {
        boolean existActiveUser = userRepository.existsByNameAndIsActiveTrue(user.getName());
        if(existActiveUser) {
            throw new InvalidOperationException("Duplicate name already in queue.", "DUPLICATE_NAME");
        }
        user.setTimeStamp(LocalDateTime.now());
        user.setActive(true);
        return userRepository.save(user);
    }

    // Update a user record within a transaction so the change remains atomic.
    @Transactional
    public User updateUser(Integer id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + id + " not found"));

        user.setName(updatedUser.getName());
        user.setPriority(updatedUser.getPriority());

        return user;
    }

    public void deleteUser(Integer id) {
        Optional<User> existingUser = userRepository.findById(id);
        if(existingUser.isPresent()) {
            User user = existingUser.get();
            user.setActive(false);
            userRepository.save(user);
        } else {
            throw new ResourceNotFoundException("User with ID " + id + " not found");
        }
    }

}
