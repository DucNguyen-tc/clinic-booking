package com.ducnguyen.clinic_profile.repository;

import com.ducnguyen.clinic_profile.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {
    List<Doctor> findBySpecialtyId(Integer specialtyId);
}
