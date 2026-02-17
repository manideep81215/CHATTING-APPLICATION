package com.app.chat.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.chat.dto.FriendRequestDTO;
import com.app.chat.service.FriendService;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> sendRequest(@Validated @RequestBody FriendRequestDTO request) {
        return ResponseEntity.ok(friendService.sendRequest(request));
    }

    @PostMapping("/request/{requestId}/accept")
    public ResponseEntity<Map<String, Object>> acceptRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(friendService.acceptRequest(requestId));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>> pendingRequests() {
        return ResponseEntity.ok(friendService.getPendingRequests());
    }

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> friends() {
        return ResponseEntity.ok(friendService.getFriends());
    }
}
