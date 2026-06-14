package com.ducnguyen.clinic_identity.config;

import com.ducnguyen.clinic_identity.entity.User;
import com.ducnguyen.clinic_identity.enums.Role;
import com.ducnguyen.clinic_identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * DataInitializer: Seed test data khi backend khởi động.
 * Chỉ tạo user nếu chưa tồn tại (idempotent).
 * PASSWORD CHO TẤT CẢ: 123456
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String PASSWORD = "123456";

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
    }

    private void seedUsers() {
        List<SeedUser> seeds = Arrays.asList(
            new SeedUser("a1b2c3d4-0001-0000-0000-000000000001", "admin@medibook.vn",        Role.ADMIN),
            new SeedUser("d1e2f3g4-0002-0000-0000-000000000002", "dr.maiphuong@medibook.vn", Role.DOCTOR),
            new SeedUser("d5e6f7g8-0003-0000-0000-000000000003", "dr.trunghieu@medibook.vn", Role.DOCTOR),
            new SeedUser("p1a2b3c4-0004-0000-0000-000000000004", "nguyenvanan@gmail.com",    Role.PATIENT),
            new SeedUser("p5a6b7c8-0005-0000-0000-000000000005", "tranthib@gmail.com",       Role.PATIENT),
            new SeedUser("p9a0b1c2-0006-0000-0000-000000000006", "levanc@gmail.com",         Role.PATIENT)
        );

        String encodedPassword = passwordEncoder.encode(PASSWORD);

        for (SeedUser seed : seeds) {
            if (!userRepository.existsById(seed.id)) {
                User user = User.builder()
                        .id(seed.id)
                        .email(seed.email)
                        .passwordHash(encodedPassword)
                        .role(seed.role)
                        .isActive(true)
                        .build();
                userRepository.save(user);
                log.info("Seeded user: {} ({})", seed.email, seed.role);
            } else {
                // Update password hash để đảm bảo password luôn là "123456"
                userRepository.findById(seed.id).ifPresent(u -> {
                    u.setPasswordHash(encodedPassword);
                    u.setRole(seed.role); // Đảm bảo role đúng
                    userRepository.save(u);
                });
                log.debug("Updated password for: {}", seed.email);
            }
        }

        log.info("DataInitializer: Done. All users have password='{}'", PASSWORD);
    }

    private record SeedUser(String id, String email, Role role) {}
}
