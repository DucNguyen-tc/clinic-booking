package com.ducnguyen.clinic_profile.service.impl;

import com.ducnguyen.clinic_profile.dto.request.PatientRequest;
import com.ducnguyen.clinic_profile.dto.response.PatientResponse;
import com.ducnguyen.clinic_profile.entity.Patient;
import com.ducnguyen.clinic_profile.exception.ResourceNotFoundException;
import com.ducnguyen.clinic_profile.mapper.PatientMapper;
import com.ducnguyen.clinic_profile.repository.PatientRepository;
import com.ducnguyen.clinic_profile.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Override
    public PatientResponse getPatientProfile(String userId) {
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + userId));
        return patientMapper.toResponse(patient);
    }

    @Override
    public PatientResponse createOrUpdateProfile(String userId, PatientRequest request) {
        Optional<Patient> existingPatient = patientRepository.findById(userId);
        Patient patient;

        if (existingPatient.isPresent()) {
            patient = existingPatient.get();
            patientMapper.updateEntity(patient, request);
        } else {
            patient = patientMapper.toEntity(request);
            patient.setUserId(userId); // Link userId from token
        }

        patient = patientRepository.save(patient);
        return patientMapper.toResponse(patient);
    }
}
