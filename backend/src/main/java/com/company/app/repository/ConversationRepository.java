package com.company.app.repository;

import com.company.app.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("select c from Conversation c where (c.userOne.id = :userA and c.userTwo.id = :userB) or (c.userOne.id = :userB and c.userTwo.id = :userA)")
    Optional<Conversation> findConversationBetween(@Param("userA") Long userA, @Param("userB") Long userB);

    @Query("select c from Conversation c where c.userOne.id = :userId or c.userTwo.id = :userId order by c.updatedAt desc")
    List<Conversation> findByUserId(@Param("userId") Long userId);
}
