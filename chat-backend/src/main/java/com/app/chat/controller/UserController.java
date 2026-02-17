package com.app.chat.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.chat.entity.User;
import com.app.chat.service.PresenceService;
import com.app.chat.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final PresenceService presenceService;

    public UserController(UserService userService, PresenceService presenceService) {
        this.userService = userService;
        this.presenceService = presenceService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me() {
        return ResponseEntity.ok(userService.getMe());
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, String>> searchByUserId(@RequestParam String userId) {
        return ResponseEntity.ok(userService.searchByUserId(userId));
    }

    @PostMapping("/presence/heartbeat")
    public ResponseEntity<Map<String, String>> heartbeat() {
        User me = userService.getCurrentUser();
        presenceService.heartbeat(me.getUserId());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(@RequestParam String userId) {
        boolean online = presenceService.isOnline(userId);
        Instant lastSeen = presenceService.getLastSeen(userId);
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("online", online);
        payload.put("lastSeenAt", lastSeen == null ? null : lastSeen.toString());
        return ResponseEntity.ok(payload);
    }
}
