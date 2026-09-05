package com.company.app.repository;

import com.company.app.model.Connection;
import com.company.app.model.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    Optional<Connection> findByRequesterIdAndRecipientId(Long requesterId, Long recipientId);

    @Query("select c from Connection c where (c.requester.id = :userId or c.recipient.id = :userId) and c.status = :status")
    List<Connection> findByUserAndStatus(@Param("userId") Long userId, @Param("status") ConnectionStatus status);

    @Query("select c from Connection c where (c.requester.id = :userId or c.recipient.id = :userId)")
    List<Connection> findByUser(@Param("userId") Long userId);

    @Query("select count(c) from Connection c where (c.requester.id = :userId or c.recipient.id = :userId) and c.status = :status")
    long countByUserAndStatus(@Param("userId") Long userId, @Param("status") ConnectionStatus status);
}
