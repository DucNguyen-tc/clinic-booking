package com.ducnguyen.clinic_medical_record.service.impl;

import com.ducnguyen.clinic_medical_record.client.NotificationClient;
import com.ducnguyen.clinic_medical_record.dto.request.CreateMedicalRecordRequest;
import com.ducnguyen.clinic_medical_record.dto.response.MedicalRecordResponse;
import com.ducnguyen.clinic_medical_record.entity.MedicalRecord;
import com.ducnguyen.clinic_medical_record.exception.ResourceNotFoundException;
import com.ducnguyen.clinic_medical_record.repository.MedicalRecordRepository;
import com.ducnguyen.clinic_medical_record.service.MedicalRecordService;
import com.ducnguyen.clinic_medical_record.service.StoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final StoragePort storagePort;
    private final NotificationClient notificationClient;

    @Override
    public MedicalRecordResponse createRecord(CreateMedicalRecordRequest request, String doctorId) {
        medicalRecordRepository.findByAppointmentId(request.getAppointmentId())
                .ifPresent(r -> {
                    throw new IllegalStateException(
                            "Lịch hẹn #" + request.getAppointmentId() + " đã có bệnh án rồi!"
                    );
                });

        MedicalRecord record = MedicalRecord.builder()
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .doctorId(doctorId)
                .diagnosis(request.getDiagnosis())
                .prescription(request.getPrescription())
                .doctorNote(request.getDoctorNote())
                .resultUrl(request.getResultUrl())
                .build();

        MedicalRecord saved = medicalRecordRepository.save(record);
        log.info("Đã tạo bệnh án ID={} cho appointmentId={}", saved.getId(), saved.getAppointmentId());

        try {
            NotificationClient.MedicalResultRequest emailReq = new NotificationClient.MedicalResultRequest();
            emailReq.setRecipientEmail("houyen080@gmail.com");
            emailReq.setPatientName("Bệnh nhân Test");
            emailReq.setDoctorName("Bác sĩ Test");
            emailReq.setAppointmentId(saved.getAppointmentId());
            emailReq.setResultUrl(saved.getResultUrl());
            notificationClient.sendMedicalResultEmail(emailReq);
            log.info("Đã gửi email kết quả khám cho appointmentId={}", saved.getAppointmentId());
        } catch (Exception e) {
            log.error("Lỗi gửi email kết quả khám: {}", e.getMessage());
        }

        return toResponse(saved);
    }

    @Override
    public String uploadResultFile(MultipartFile file, Long appointmentId) {
        String folderPath = "records/appointment-" + appointmentId + "/";
        String url = storagePort.uploadFile(file, folderPath);
        log.info("Upload file cho appointmentId={}: {}", appointmentId, url);
        return url;
    }

    @Override
    public List<MedicalRecordResponse> getMyRecords(String patientId) {
        return medicalRecordRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalRecordResponse getRecordById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bệnh án ID: " + id));
        return toResponse(record);
    }

    @Override
    public MedicalRecordResponse getRecordByAppointmentId(Long appointmentId) {
        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bệnh án cho lịch hẹn ID: " + appointmentId
                ));
        return toResponse(record);
    }

    private MedicalRecordResponse toResponse(MedicalRecord record) {
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .appointmentId(record.getAppointmentId())
                .patientId(record.getPatientId())
                .doctorId(record.getDoctorId())
                .diagnosis(record.getDiagnosis())
                .prescription(record.getPrescription())
                .doctorNote(record.getDoctorNote())
                .resultUrl(record.getResultUrl())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
