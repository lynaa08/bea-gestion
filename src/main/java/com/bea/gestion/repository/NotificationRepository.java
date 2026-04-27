package com.bea.gestion.repository;

import com.bea.gestion.entity.Notification;
import com.bea.gestion.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByDateCreationDesc(User user);

    long countByUserAndLueFalse(User user);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.lue = true WHERE n.user = :user")
    void markAllAsRead(@Param("user") User user);
}
