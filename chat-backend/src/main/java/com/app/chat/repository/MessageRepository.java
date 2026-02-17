package com.app.chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.app.chat.entity.Message;
import com.app.chat.entity.User;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderAndReceiverOrSenderAndReceiverOrderBySentAtAsc(
            User sender1, User receiver1, User sender2, User receiver2);

    @Query("""
            SELECT m FROM Message m
            WHERE ((m.sender = :currentUser AND m.receiver = :otherUser)
                OR (m.sender = :otherUser AND m.receiver = :currentUser))
              AND NOT EXISTS (
                SELECT 1 FROM DeletedMessage dm
                WHERE dm.user = :currentUser AND dm.message = m
              )
            ORDER BY m.sentAt ASC
            """)
    List<Message> findConversationVisibleToUser(@Param("currentUser") User currentUser, @Param("otherUser") User otherUser);

    @Modifying
    @Query("""
            DELETE FROM Message m
            WHERE (m.sender = :currentUser AND m.receiver = :otherUser)
               OR (m.sender = :otherUser AND m.receiver = :currentUser)
            """)
    int deleteConversationBetween(@Param("currentUser") User currentUser, @Param("otherUser") User otherUser);
}
