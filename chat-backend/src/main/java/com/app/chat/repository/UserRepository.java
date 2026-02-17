package com.app.chat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.chat.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByUserId(String userId);

    boolean existsByUsername(String username);

    boolean existsByUserId(String userId);
}
