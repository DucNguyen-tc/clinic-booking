package com.ducnguyen.clinic_profile.service.impl;

import com.ducnguyen.clinic_profile.dto.request.SpecialtyRequest;
import com.ducnguyen.clinic_profile.dto.response.SpecialtyResponse;
import com.ducnguyen.clinic_profile.entity.Specialty;
import com.ducnguyen.clinic_profile.exception.ResourceNotFoundException;
import com.ducnguyen.clinic_profile.mapper.SpecialtyMapper;
import com.ducnguyen.clinic_profile.repository.SpecialtyRepository;
import com.ducnguyen.clinic_profile.service.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialtyServiceImpl implements SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final SpecialtyMapper specialtyMapper;

    @Override
    public List<SpecialtyResponse> getAllSpecialties() {
        return specialtyRepository.findAll().stream()
                .map(specialtyMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SpecialtyResponse getSpecialtyById(Integer id) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty not found with id: " + id));
        return specialtyMapper.toResponse(specialty);
    }

    @Override
    public SpecialtyResponse createSpecialty(SpecialtyRequest request) {
        Specialty specialty = specialtyMapper.toEntity(request);
        specialty = specialtyRepository.save(specialty);
        return specialtyMapper.toResponse(specialty);
    }

    @Override
    public SpecialtyResponse updateSpecialty(Integer id, SpecialtyRequest request) {
        Specialty specialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty not found with id: " + id));
        specialtyMapper.updateEntity(specialty, request);
        specialty = specialtyRepository.save(specialty);
        return specialtyMapper.toResponse(specialty);
    }

    @Override
    public void deleteSpecialty(Integer id) {
        if (!specialtyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Specialty not found with id: " + id);
        }
        specialtyRepository.deleteById(id);
    }
}
