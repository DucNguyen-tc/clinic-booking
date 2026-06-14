package com.ducnguyen.clinic_medical_record.service.impl;

import com.ducnguyen.clinic_medical_record.client.AppointmentClient;
import com.ducnguyen.clinic_medical_record.client.NotificationClient;
import com.ducnguyen.clinic_medical_record.dto.request.CreateMedicalRecordRequest;
import com.ducnguyen.clinic_medical_record.dto.response.MedicalRecordResponse;
import com.ducnguyen.clinic_medical_record.entity.MedicalRecord;
import com.ducnguyen.clinic_medical_record.exception.ResourceNotFoundException;
import com.ducnguyen.clinic_medical_record.repository.MedicalRecordRepository;
import com.ducnguyen.clinic_medical_record.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final NotificationClient notificationClient;
    private final AppointmentClient appointmentClient;
    private final com.ducnguyen.clinic_medical_record.client.IdentityClient identityClient;
    private final com.ducnguyen.clinic_medical_record.client.ProfileClient profileClient;

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
                .build();

        MedicalRecord saved = medicalRecordRepository.save(record);
        log.info("Đã tạo bệnh án ID={} cho appointmentId={}", saved.getId(), saved.getAppointmentId());

        try {
            appointmentClient.completeAppointment(saved.getAppointmentId(), doctorId, "DOCTOR");
            log.info("Đã cập nhật trạng thái COMPLETED cho appointmentId={}", saved.getAppointmentId());
        } catch (Exception e) {
            log.error("Lỗi khi gọi clinic_appointment để cập nhật status: {}", e.getMessage());
        }

        try {
            // Lấy thông tin thực tế từ các Service khác
            String patientEmail = identityClient.getUserById(request.getPatientId()).getData().getEmail();
            String patientName = profileClient.getPatientProfile(request.getPatientId(), doctorId, "DOCTOR").getData().getFullName();
            String doctorName = profileClient.getDoctorProfile(doctorId, doctorId, "DOCTOR").getData().getFullName();

            NotificationClient.MedicalResultRequest emailReq = new NotificationClient.MedicalResultRequest();
            emailReq.setRecipientEmail(patientEmail);
            emailReq.setPatientName(patientName);
            emailReq.setDoctorName(doctorName);
            emailReq.setAppointmentId(saved.getAppointmentId());
            notificationClient.sendMedicalResultEmail(emailReq);
            log.info("Đã gửi email kết quả khám cho appointmentId={}", saved.getAppointmentId());
        } catch (Exception e) {
            log.error("Lỗi gửi email kết quả khám: {}", e.getMessage());
        }

        return toResponse(saved);
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
                .createdAt(record.getCreatedAt())
                .build();
    }
}
