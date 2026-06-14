import { api } from '@/lib/axios'
import type {
  DoctorApiResponse,
  SpecialtyApiResponse,
  SlotLockApiResponse,
  AppointmentApiCreateResponse,
  PatientDoctor,
  PatientSpecialty,
} from '@/types/patient-booking'

// -------------------------------------------------------
// SPECIALTY SERVICE
// -------------------------------------------------------
export const specialtyService = {
  getAll: async (): Promise<PatientSpecialty[]> => {
    const response = await api.get<{ data: SpecialtyApiResponse[] }>('/api/specialties')
    const raw = response.data.data
    // Map icon names theo tên chuyên khoa
    const iconMap: Record<string, string> = {
      'Tim mạch': 'Heart',
      'Nhi khoa': 'Baby',
      'Da liễu': 'Sparkles',
      'Thần kinh': 'Brain',
      'Nha khoa': 'Smile',
      'Tâm lý': 'Activity',
      'Xương khớp': 'Bone',
      'Mắt': 'Eye',
      'Tai Mũi Họng': 'Ear',
      'Nội tiết': 'Zap',
    }
    return raw.map((s) => ({
      id: String(s.id),
      numericId: s.id,
      name: s.name,
      count: 0,
      iconName: iconMap[s.name] || 'Stethoscope',
    }))
  },
}

// -------------------------------------------------------
// DOCTOR SERVICE (for patient view)
// -------------------------------------------------------
export const patientDoctorService = {
  getAll: async (specialtyId?: number): Promise<PatientDoctor[]> => {
    const params = specialtyId ? { specialtyId } : {}
    const response = await api.get<{ data: DoctorApiResponse[] }>('/api/doctors', { params })
    const raw = response.data.data
    return raw.map((d) => ({
      id: d.userId,
      name: d.fullName,
      title: d.degree || 'BS',
      specialtyId: String(d.specialty?.id || 1),
      specialtyName: d.specialty?.name || '',
      experience: `${d.experienceYears} năm kinh nghiệm`,
      hospital: d.hospital || 'Phòng khám MediBook',
      location: d.location || 'Việt Nam',
      imageUrl: d.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.fullName)}&background=a72a7c&color=fff&size=200`,
      rating: d.rating || 4.5,
      price: d.price || 300000,
    }))
  },
}

// -------------------------------------------------------
// SLOT LOCK SERVICE
// -------------------------------------------------------
export const slotService = {
  /**
   * Lấy danh sách slot trống của bác sĩ theo ngày
   * GET /api/slots/available?doctorId=...&date=...
   */
  getAvailableSlots: async (doctorId: string, date: string): Promise<string[]> => {
    try {
      const response = await api.get<{ data: string[] }>('/api/slots/available', {
        params: { doctorId, date },
      })
      // Backend trả về LocalTime array, normalize về "HH:mm"
      return (response.data.data || []).map((t) => t.substring(0, 5))
    } catch {
      // Fallback nếu backend chưa có data
      return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
    }
  },

  /**
   * Khóa slot trước khi thanh toán
   * POST /api/slots/lock
   */
  lockSlot: async (
    doctorId: string,
    lockDate: string,
    slotTime: string
  ): Promise<SlotLockApiResponse> => {
    const response = await api.post<{ data: SlotLockApiResponse }>('/api/slots/lock', {
      doctorId,
      lockDate,    // "YYYY-MM-DD"
      slotTime,    // "HH:mm:00"
    })
    return response.data.data
  },
}

// -------------------------------------------------------
// APPOINTMENT BOOKING SERVICE (for patient)
// -------------------------------------------------------
export const bookingService = {
  /**
   * Tạo appointment sau khi đã lock slot
   * POST /api/appointments
   */
  createAppointment: async (
    slotLockId: number,
    specialtyId: number,
    patientName: string,
    patientPhone: string,
    notes: string
  ): Promise<AppointmentApiCreateResponse> => {
    const response = await api.post<{ data: AppointmentApiCreateResponse }>('/api/appointments', {
      slotLockId,
      specialtyId,
      patientName,
      patientPhone,
      notes,
    })
    return response.data.data
  },

  /**
   * Lấy appointments của bệnh nhân đang login
   * GET /api/appointments (backend lọc theo role PATIENT)
   */
  getMyAppointments: async (): Promise<AppointmentApiCreateResponse[]> => {
    const response = await api.get<{ data: AppointmentApiCreateResponse[] }>('/api/appointments')
    return response.data.data || []
  },

  /**
   * Hủy appointment
   * PUT /api/appointments/{id}/cancel
   */
  cancelAppointment: async (id: number): Promise<void> => {
    await api.put(`/api/appointments/${id}/cancel`)
  },
}
