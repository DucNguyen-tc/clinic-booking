package com.ducnguyen.clinic_appointment.state;

import com.ducnguyen.clinic_appointment.entity.Appointment;
import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;
import com.ducnguyen.clinic_appointment.exception.CustomException;

public class ConfirmedState implements AppointmentState {

    @Override
    public AppointmentStatus getStatus() {
        return AppointmentStatus.CONFIRMED;
    }

    @Override
    public void confirm(Appointment appointment) {
        throw new CustomException("Appointment is already confirmed");
    }

    @Override
    public void complete(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.COMPLETED);
    }

    @Override
    public void cancel(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.CANCELLED);
    }
}
