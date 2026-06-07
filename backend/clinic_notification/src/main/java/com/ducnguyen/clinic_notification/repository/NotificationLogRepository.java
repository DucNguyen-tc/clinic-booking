package com.ducnguyen.clinic_notification.repository;

import com.ducnguyen.clinic_notification.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
}
