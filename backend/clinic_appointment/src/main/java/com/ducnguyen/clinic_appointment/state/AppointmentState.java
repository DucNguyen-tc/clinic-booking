package com.ducnguyen.clinic_appointment.state;

import com.ducnguyen.clinic_appointment.entity.Appointment;
import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;

public interface AppointmentState {
    AppointmentStatus getStatus();
    void confirm(Appointment appointment);
    void complete(Appointment appointment);
    void cancel(Appointment appointment);
}
