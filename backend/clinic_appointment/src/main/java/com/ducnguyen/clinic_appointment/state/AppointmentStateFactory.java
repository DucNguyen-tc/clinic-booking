package com.ducnguyen.clinic_appointment.state;

import com.ducnguyen.clinic_appointment.enums.AppointmentStatus;

public class AppointmentStateFactory {
    public static AppointmentState getState(AppointmentStatus status) {
        if (status == null) {
            return new PendingPaymentState();
        }
        return switch (status) {
            case PENDING_PAYMENT -> new PendingPaymentState();
            case CONFIRMED -> new ConfirmedState();
            case COMPLETED -> new CompletedState();
            case CANCELLED -> new CancelledState();
        };
    }
}
