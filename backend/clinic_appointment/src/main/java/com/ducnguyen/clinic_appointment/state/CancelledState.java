package com.ducnguyen.clinic_appointment.state;

import com.ducnguyen.clinic_appointment.entity.Appointment;
import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;
import com.ducnguyen.clinic_appointment.exception.CustomException;

public class CancelledState implements AppointmentState {

    @Override
    public AppointmentStatus getStatus() {
        return AppointmentStatus.CANCELLED;
    }

    @Override
    public void confirm(Appointment appointment) {
        throw new CustomException("Cannot confirm a cancelled appointment");
    }

    @Override
    public void complete(Appointment appointment) {
        throw new CustomException("Cannot complete a cancelled appointment");
    }

    @Override
    public void cancel(Appointment appointment) {
        throw new CustomException("Appointment is already cancelled");
    }
}
