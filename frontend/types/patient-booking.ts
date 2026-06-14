// ========================================
// Patient Booking Types (Medibook)
// ========================================

export interface PatientDoctor {
  id: string;
  name: string;
  title: string; // PGS.TS, ThS.BS, ...
  specialtyId: string;
  specialtyName: string;
  experience: string;
  hospital: string;
  location: string;
  imageUrl: string;
  rating: number;
  price: number;
}

export interface PatientSpecialty {
  id: string;
  numericId?: number; // backend integer ID
  name: string;
  count: number;
  iconName: string;
}

export interface PatientAppointment {
  id: string;           // local display ID "MB-XXXXXX"
  backendId?: number;   // backend integer ID
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  specialtyName: string;
  hospital: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientPhone: string;
  patientNotes?: string;
  paymentMethod: string;
  status: 'upcoming' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface PatientChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Backend doctor response format
export interface DoctorApiResponse {
  userId: string;
  fullName: string;
  degree: string;          // "PGS.TS", "ThS.BS"
  specialty: {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
  };
  experienceYears: number;
  price: number;
  avatarUrl?: string;
  rating?: number;
  hospital?: string;
  location?: string;
}

// Backend specialty response format
export interface SpecialtyApiResponse {
  id: number;
  name: string;
  description?: string;
}

// Backend slot lock response
export interface SlotLockApiResponse {
  id: number;
  doctorId: string;
  patientId: string;
  lockDate: string;
  slotTime: string;
  expiresAt: string;  // Fix: đổi từ expiredAt → expiresAt khớp với SlotLockResponse.java
}

export interface AppointmentApiCreateResponse {
  id: number;
  patientId: string;
  doctorId: string;
  specialtyId: number;
  appointmentDate: string;
  slotTime: string;
  status: string;
  patientName?: string;
  patientPhone?: string;
  notes?: string;
  createdAt: string;
}
