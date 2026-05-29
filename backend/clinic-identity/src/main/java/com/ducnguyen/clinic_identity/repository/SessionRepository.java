package com.ducnguyen.clinic_identity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ducnguyen.clinic_identity.entity.Session;

@Repository
public interface SessionRepository extends JpaRepository<Session, String> {
    Optional<Session> findByRefreshToken(String refreshToken);
    void deleteByUserId(String userId);
    void deleteByRefreshToken(String refreshToken);
    boolean existsByRefreshToken(String refreshToken);
}
