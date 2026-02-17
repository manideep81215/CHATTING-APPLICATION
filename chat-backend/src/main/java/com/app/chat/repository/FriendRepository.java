package com.app.chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.chat.entity.Friend;
import com.app.chat.entity.User;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    boolean existsByUserAndFriend(User user, User friend);

    List<Friend> findByUser(User user);
}
