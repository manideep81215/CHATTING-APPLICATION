package com.app.chat.dto;

import com.app.chat.entity.Message.MessageType;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDTO {

    @NotBlank
    private String receiverUserId;

    private String content;

    private String fileUrl;

    private MessageType type = MessageType.TEXT;
}
