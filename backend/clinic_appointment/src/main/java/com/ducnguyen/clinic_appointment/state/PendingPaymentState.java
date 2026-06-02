package com.ducnguyen.clinic_appointment.state;

import com.ducnguyen.clinic_appointment.entity.Appointment;
import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;
import com.ducnguyen.clinic_appointment.exception.CustomException;

public class PendingPaymentState implements AppointmentState {

    @Override
    public AppointmentStatus getStatus() {
        return AppointmentStatus.PENDING_PAYMENT;
    }

    @Override
    public void confirm(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.CONFIRMED);
    }

    @Override
    public void complete(Appointment appointment) {
        throw new CustomException("Cannot complete an unpaid appointment");
    }

    @Override
    public void cancel(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.CANCELLED);
    }
}
