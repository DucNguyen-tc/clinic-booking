package com.ducnguyen.clinic_profile.service.impl;

import com.ducnguyen.clinic_profile.dto.request.DoctorRequest;
import com.ducnguyen.clinic_profile.dto.response.DoctorResponse;
import com.ducnguyen.clinic_profile.entity.Doctor;
import com.ducnguyen.clinic_profile.entity.Specialty;
import com.ducnguyen.clinic_profile.exception.ResourceNotFoundException;
import com.ducnguyen.clinic_profile.mapper.DoctorMapper;
import com.ducnguyen.clinic_profile.repository.DoctorRepository;
import com.ducnguyen.clinic_profile.repository.SpecialtyRepository;
import com.ducnguyen.clinic_profile.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorMapper doctorMapper;

    @Override
    public List<DoctorResponse> getAllDoctors(Integer specialtyId) {
        List<Doctor> doctors;
        if (specialtyId != null) {
            doctors = doctorRepository.findBySpecialtyId(specialtyId);
        } else {
            doctors = doctorRepository.findAll();
        }
        return doctors.stream()
                .map(doctorMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorResponse getDoctorById(String userId) {
        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + userId));
        return doctorMapper.toResponse(doctor);
    }

    @Override
    public DoctorResponse createOrUpdateDoctor(String userId, DoctorRequest request) {
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialty not found with id: " + request.getSpecialtyId()));

        Optional<Doctor> existingDoctor = doctorRepository.findById(userId);
        Doctor doctor;

        if (existingDoctor.isPresent()) {
            doctor = existingDoctor.get();
            doctorMapper.updateEntity(doctor, request);
        } else {
            doctor = doctorMapper.toEntity(request);
            doctor.setUserId(userId);
        }
        
        doctor.setSpecialty(specialty);
        doctor = doctorRepository.save(doctor);
        
        return doctorMapper.toResponse(doctor);
    }

    @Override
    public void deleteDoctor(String userId) {
        if (!doctorRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Doctor not found with id: " + userId);
        }
        doctorRepository.deleteById(userId);
    }
}
