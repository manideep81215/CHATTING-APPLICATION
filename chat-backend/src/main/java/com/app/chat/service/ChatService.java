package com.app.chat.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.app.chat.dto.ChatMessageDTO;
import com.app.chat.dto.TypingStatusDTO;
import com.app.chat.entity.DeletedMessage;
import com.app.chat.entity.Message;
import com.app.chat.entity.User;
import com.app.chat.repository.DeletedMessageRepository;
import com.app.chat.repository.MessageRepository;
import com.app.chat.repository.UserRepository;

@Service
public class ChatService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final DeletedMessageRepository deletedMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(
            UserService userService,
            UserRepository userRepository,
            MessageRepository messageRepository,
            DeletedMessageRepository deletedMessageRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.deletedMessageRepository = deletedMessageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Map<String, Object> sendMessage(ChatMessageDTO messageDTO) {
        User sender = userService.getCurrentUser();
        User receiver = userRepository.findByUserId(messageDTO.getReceiverUserId())
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setType(messageDTO.getType());
        message.setContent(messageDTO.getContent());
        message.setFileUrl(messageDTO.getFileUrl());

        Message saved = messageRepository.save(message);

        Map<String, Object> payload = toPayload(saved);
        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", payload);
        messagingTemplate.convertAndSendToUser(sender.getUsername(), "/queue/messages", payload);

        return payload;
    }

    public List<Map<String, Object>> getConversation(String otherUserId) {
        User current = userService.getCurrentUser();
        User other = userRepository.findByUserId(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return messageRepository.findConversationVisibleToUser(current, other)
                .stream()
                .map(this::toPayload)
                .collect(Collectors.toList());
    }

    public void sendTypingStatus(TypingStatusDTO typingStatusDTO) {
        User sender = userService.getCurrentUser();
        User receiver = userRepository.findByUserId(typingStatusDTO.getReceiverUserId())
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        Map<String, Object> payload = Map.of(
                "senderUserId", sender.getUserId(),
                "receiverUserId", receiver.getUserId(),
                "typing", typingStatusDTO.isTyping());

        messagingTemplate.convertAndSend("/topic/typing", payload);
    }

    @Transactional
    public int deleteConversation(String otherUserId) {
        User current = userService.getCurrentUser();
        User other = userRepository.findByUserId(otherUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        List<Message> conversation = messageRepository
                .findConversationVisibleToUser(current, other);
        if (conversation.isEmpty()) {
            return 0;
        }
        List<DeletedMessage> markers = conversation.stream()
                .map(message -> {
                    DeletedMessage dm = new DeletedMessage();
                    dm.setUser(current);
                    dm.setMessage(message);
                    return dm;
                })
                .toList();
        deletedMessageRepository.saveAll(markers);
        return markers.size();
    }

    private Map<String, Object> toPayload(Message message) {
        return Map.of(
                "id", message.getId(),
                "senderUserId", message.getSender().getUserId(),
                "receiverUserId", message.getReceiver().getUserId(),
                "content", message.getContent() == null ? "" : message.getContent(),
                "fileUrl", message.getFileUrl() == null ? "" : message.getFileUrl(),
                "type", message.getType().name(),
                "sentAt", message.getSentAt().toString());
    }
}
