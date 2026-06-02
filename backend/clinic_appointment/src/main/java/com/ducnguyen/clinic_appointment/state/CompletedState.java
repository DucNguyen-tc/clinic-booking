package com.ducnguyen.clinic_appointment.state;

import com.ducnguyen.clinic_appointment.entity.Appointment;
import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;
import com.ducnguyen.clinic_appointment.exception.CustomException;

public class CompletedState implements AppointmentState {

    @Override
    public AppointmentStatus getStatus() {
        return AppointmentStatus.COMPLETED;
    }

    @Override
    public void confirm(Appointment appointment) {
        throw new CustomException("Cannot confirm a completed appointment");
    }

    @Override
    public void complete(Appointment appointment) {
        throw new CustomException("Appointment is already completed");
    }

    @Override
    public void cancel(Appointment appointment) {
        throw new CustomException("Cannot cancel a completed appointment");
    }
}
