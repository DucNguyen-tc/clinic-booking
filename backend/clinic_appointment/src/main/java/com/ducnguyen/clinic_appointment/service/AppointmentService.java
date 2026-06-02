package com.ducnguyen.clinic_appointment.service;

import com.ducnguyen.clinic_appointment.dto.request.AppointmentCreateRequest;
import com.ducnguyen.clinic_appointment.dto.response.AppointmentResponse;

import java.util.List;

public interface AppointmentService {
    AppointmentResponse createAppointment(AppointmentCreateRequest request, String patientId);
    AppointmentResponse confirmAppointment(Integer id);
    AppointmentResponse completeAppointment(Integer id);
    AppointmentResponse cancelAppointment(Integer id);
    AppointmentResponse getAppointmentById(Integer id);
    List<AppointmentResponse> getAppointments(String userId, String role);
}
