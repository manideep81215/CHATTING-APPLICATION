package com.app.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TypingStatusDTO {

    @NotBlank
    private String receiverUserId;

    private boolean typing;
}

