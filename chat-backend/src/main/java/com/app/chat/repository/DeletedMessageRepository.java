package com.app.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.chat.entity.DeletedMessage;

public interface DeletedMessageRepository extends JpaRepository<DeletedMessage, Long> {
}
