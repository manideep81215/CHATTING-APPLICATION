package com.app.chat.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.chat.dto.ChatMessageDTO;
import com.app.chat.dto.TypingStatusDTO;
import com.app.chat.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDTO messageDTO) {
        chatService.sendMessage(messageDTO);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<Map<String, Object>>> messages(@RequestParam String userId) {
        return ResponseEntity.ok(chatService.getConversation(userId));
    }

    @GetMapping("/send")
    public ResponseEntity<Map<String, Object>> sendViaHttp(@Validated ChatMessageDTO messageDTO) {
        return ResponseEntity.ok(chatService.sendMessage(messageDTO));
    }

    @PostMapping("/typing")
    public ResponseEntity<Map<String, String>> typing(@Validated @RequestBody TypingStatusDTO typingStatusDTO) {
        chatService.sendTypingStatus(typingStatusDTO);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @DeleteMapping("/messages")
    public ResponseEntity<Map<String, Object>> deleteConversation(@RequestParam String userId) {
        int deleted = chatService.deleteConversation(userId);
        return ResponseEntity.ok(Map.of("status", "ok", "deletedCount", deleted));
    }

    @PostMapping("/messages/delete")
    public ResponseEntity<Map<String, Object>> deleteConversationViaPost(@RequestParam String userId) {
        int deleted = chatService.deleteConversation(userId);
        return ResponseEntity.ok(Map.of("status", "ok", "deletedCount", deleted));
    }

    @GetMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteConversationViaGet(@RequestParam String userId) {
        int deleted = chatService.deleteConversation(userId);
        return ResponseEntity.ok(Map.of("status", "ok", "deletedCount", deleted));
    }
}
