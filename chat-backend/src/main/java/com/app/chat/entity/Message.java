package com.app.chat.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Message {

    public enum MessageType {
        TEXT,
        IMAGE,
        FILE,
        VOICE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageType type;

    @Column(nullable = false)
    private Instant sentAt;

    @PrePersist
    public void prePersist() {
        if (type == null) {
            type = MessageType.TEXT;
        }
        if (sentAt == null) {
            sentAt = Instant.now();
        }
    }
}
