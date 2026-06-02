package com.ducnguyen.clinic_profile.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId; // Soft Ref to clinic_identity.users.id

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String degree;

    @Column(name = "experience_years")
    private Integer experienceYears;

    private BigDecimal price;
}
