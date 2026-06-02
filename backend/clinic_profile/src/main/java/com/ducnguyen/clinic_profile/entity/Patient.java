package com.ducnguyen.clinic_profile.entity;

import com.ducnguyen.clinic_profile.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId; // Soft Ref to clinic_identity.users.id

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String phone;
}
