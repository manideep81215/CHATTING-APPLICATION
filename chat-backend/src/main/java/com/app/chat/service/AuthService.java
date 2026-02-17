package com.app.chat.service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.app.chat.config.JwtService;
import com.app.chat.dto.LoginRequest;
import com.app.chat.dto.RegisterRequest;
import com.app.chat.entity.User;
import com.app.chat.repository.UserRepository;

@Service
public class AuthService {

    private static final String USER_ID_PREFIX = "USR";
    private static final String USER_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public Map<String, String> register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName());
        user.setUserId(generateUniqueUserId());

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", saved.getUserId());
        response.put("username", saved.getUsername());
        return response;
    }

    public Map<String, String> login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        String token = jwtService.generateToken(user);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getUserId());
        response.put("username", user.getUsername());
        return response;
    }

    private String generateUniqueUserId() {
        String id;
        do {
            StringBuilder sb = new StringBuilder(USER_ID_PREFIX);
            for (int i = 0; i < 8; i++) {
                sb.append(USER_ID_CHARS.charAt(secureRandom.nextInt(USER_ID_CHARS.length())));
            }
            id = sb.toString();
        } while (userRepository.existsByUserId(id));
        return id;
    }
}
