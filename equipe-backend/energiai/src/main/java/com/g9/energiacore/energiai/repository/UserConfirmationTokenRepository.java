package com.g9.energiacore.energiai.repository;

import com.g9.energiacore.energiai.domain.UserConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserConfirmationTokenRepository extends JpaRepository<UserConfirmationToken, Long> {
    Optional<UserConfirmationToken> findByToken(String token);
}
