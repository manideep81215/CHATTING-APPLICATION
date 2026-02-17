package com.app.chat.service;

import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.app.chat.entity.User;
import com.app.chat.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Map<String, String> getMe() {
        User me = getCurrentUser();
        return Map.of(
                "userId", me.getUserId(),
                "username", me.getUsername(),
                "displayName", me.getDisplayName());
    }

    public Map<String, String> searchByUserId(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return Map.of(
                "userId", user.getUserId(),
                "username", user.getUsername(),
                "displayName", user.getDisplayName());
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new IllegalStateException("No authenticated user found");
    }
}
