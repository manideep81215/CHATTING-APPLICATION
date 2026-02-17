package com.app.chat.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.chat.dto.FriendRequestDTO;
import com.app.chat.entity.Friend;
import com.app.chat.entity.FriendRequest;
import com.app.chat.entity.FriendRequest.Status;
import com.app.chat.entity.User;
import com.app.chat.repository.FriendRepository;
import com.app.chat.repository.FriendRequestRepository;
import com.app.chat.repository.UserRepository;

@Service
public class FriendService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final FriendRepository friendRepository;

    public FriendService(
            UserService userService,
            UserRepository userRepository,
            FriendRequestRepository friendRequestRepository,
            FriendRepository friendRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.friendRepository = friendRepository;
    }

    @Transactional
    public Map<String, Object> sendRequest(FriendRequestDTO requestDTO) {
        User sender = userService.getCurrentUser();
        User receiver = userRepository.findByUserId(requestDTO.getTargetUserId())
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("You cannot send a request to yourself");
        }

        if (friendRepository.existsByUserAndFriend(sender, receiver)) {
            throw new IllegalArgumentException("You are already friends");
        }

        friendRequestRepository.findBySenderAndReceiverAndStatus(sender, receiver, Status.PENDING)
                .ifPresent(fr -> {
                    throw new IllegalArgumentException("Friend request already sent");
                });

        FriendRequest request = new FriendRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(Status.PENDING);

        FriendRequest saved = friendRequestRepository.save(request);
        return Map.of(
                "requestId", saved.getId(),
                "status", saved.getStatus().name());
    }

    @Transactional
    public Map<String, Object> acceptRequest(Long requestId) {
        User current = userService.getCurrentUser();
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));

        if (!request.getReceiver().getId().equals(current.getId())) {
            throw new IllegalArgumentException("You can only accept requests sent to you");
        }

        request.setStatus(Status.ACCEPTED);
        friendRequestRepository.save(request);

        createFriendLink(request.getSender(), request.getReceiver());
        createFriendLink(request.getReceiver(), request.getSender());

        return Map.of(
                "requestId", request.getId(),
                "status", request.getStatus().name());
    }

    public List<Map<String, Object>> getPendingRequests() {
        User current = userService.getCurrentUser();
        return friendRequestRepository.findByReceiverAndStatus(current, Status.PENDING)
                .stream()
                .map(fr -> Map.of(
                        "requestId", (Object) fr.getId(),
                        "fromUserId", fr.getSender().getUserId(),
                        "fromUsername", fr.getSender().getUsername(),
                        "status", fr.getStatus().name()))
                .collect(Collectors.toList());
    }

    public List<Map<String, String>> getFriends() {
        User current = userService.getCurrentUser();
        return friendRepository.findByUser(current)
                .stream()
                .map(f -> Map.of(
                        "userId", f.getFriend().getUserId(),
                        "username", f.getFriend().getUsername(),
                        "displayName", f.getFriend().getDisplayName()))
                .collect(Collectors.toList());
    }

    private void createFriendLink(User user, User friendUser) {
        if (friendRepository.existsByUserAndFriend(user, friendUser)) {
            return;
        }
        Friend friend = new Friend();
        friend.setUser(user);
        friend.setFriend(friendUser);
        friendRepository.save(friend);
    }
}
