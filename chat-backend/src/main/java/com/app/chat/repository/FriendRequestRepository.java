package com.app.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.chat.entity.FriendRequest;
import com.app.chat.entity.FriendRequest.Status;
import com.app.chat.entity.User;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    Optional<FriendRequest> findBySenderAndReceiverAndStatus(User sender, User receiver, Status status);

    List<FriendRequest> findByReceiverAndStatus(User receiver, Status status);
}
