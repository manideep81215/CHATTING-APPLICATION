package com.app.chat.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class PresenceService {

    private static final Duration ONLINE_WINDOW = Duration.ofSeconds(25);
    private final Map<String, Instant> lastSeenByUserId = new ConcurrentHashMap<>();

    public void heartbeat(String userId) {
        lastSeenByUserId.put(userId, Instant.now());
    }

    public boolean isOnline(String userId) {
        Instant lastSeen = lastSeenByUserId.get(userId);
        if (lastSeen == null) {
            return false;
        }
        return Duration.between(lastSeen, Instant.now()).compareTo(ONLINE_WINDOW) <= 0;
    }

    public Instant getLastSeen(String userId) {
        return lastSeenByUserId.get(userId);
    }
}
