"use client"

import { Users } from "lucide-react"
import { PatientListTable } from "@/components/doctor/patient-list-table"
import type { PatientRecord } from "@/types/patient"

// ── Mock Data (15 patients — diverse) ─────────────────────────────────────────

const MOCK_PATIENTS: PatientRecord[] = [
  { id: "p1",  code: "BN-2023-0891", name: "Nguyễn Văn An",     age: 45, gender: "male",   phone: "090 123 4567", initials: "NA", bloodType: "A+",  lastVisitDate: "12/10/2023", totalVisits: 8,  status: "active" },
  { id: "p2",  code: "BN-2023-1102", name: "Lê Thị Hoa",        age: 32, gender: "female", phone: "091 888 9999", initials: "LH", bloodType: "O+",  lastVisitDate: "05/11/2023", totalVisits: 4,  status: "active" },
  { id: "p3",  code: "BN-2023-0544", name: "Trần Minh Quân",    age: 28, gender: "male",   phone: "098 765 4321", initials: "TQ", bloodType: "B+",  lastVisitDate: "28/10/2023", totalVisits: 12, status: "active" },
  { id: "p4",  code: "BN-2023-1120", name: "Phạm Thị Lan",      age: 65, gender: "female", phone: "033 445 5667", initials: "PL", bloodType: "AB-", lastVisitDate: "02/11/2023", totalVisits: 2,  status: "active" },
  { id: "p5",  code: "BN-2023-0312", name: "Hoàng Đức Trọng",   age: 58, gender: "male",   phone: "097 654 3210", initials: "HT", bloodType: "O-",  lastVisitDate: "20/09/2023", totalVisits: 15, status: "active" },
  { id: "p6",  code: "BN-2023-0678", name: "Vũ Ngọc Mai",       age: 23, gender: "female", phone: "086 222 3344", initials: "VM", bloodType: "A-",  lastVisitDate: "18/10/2023", totalVisits: 3,  status: "active" },
  { id: "p7",  code: "BN-2023-0923", name: "Đỗ Quang Huy",      age: 41, gender: "male",   phone: "070 111 2233", initials: "DH", bloodType: "B-",  lastVisitDate: "01/11/2023", totalVisits: 6,  status: "active" },
  { id: "p8",  code: "BN-2023-1245", name: "Ngô Thị Thanh",     age: 55, gender: "female", phone: "038 999 0011", initials: "NT", bloodType: "AB+", lastVisitDate: "08/10/2023", totalVisits: 10, status: "inactive" },
  { id: "p9",  code: "BN-2023-0456", name: "Bùi Văn Khoa",      age: 37, gender: "male",   phone: "076 543 2100", initials: "BK", bloodType: "O+",  lastVisitDate: "25/10/2023", totalVisits: 7,  status: "active" },
  { id: "p10", code: "BN-2023-0789", name: "Trịnh Minh Châu",   age: 49, gender: "female", phone: "082 334 5566", initials: "TC", bloodType: "A+",  lastVisitDate: "30/10/2023", totalVisits: 5,  status: "active" },
  { id: "p11", code: "BN-2023-1356", name: "Lý Quốc Bảo",       age: 72, gender: "male",   phone: "093 456 7890", initials: "LB", bloodType: "B+",  lastVisitDate: "15/09/2023", totalVisits: 20, status: "active" },
  { id: "p12", code: "BN-2023-1478", name: "Đinh Thị Hằng",     age: 19, gender: "female", phone: "079 876 5432", initials: "DH", bloodType: "O-",  lastVisitDate: "03/11/2023", totalVisits: 1,  status: "active" },
  { id: "p13", code: "BN-2023-0234", name: "Phan Văn Đức",      age: 60, gender: "male",   phone: "085 678 9012", initials: "PD", bloodType: "AB+", lastVisitDate: "22/10/2023", totalVisits: 9,  status: "inactive" },
  { id: "p14", code: "BN-2023-1567", name: "Mai Thị Kim Ngân",  age: 34, gender: "female", phone: "069 012 3456", initials: "MN", bloodType: "A-",  lastVisitDate: "07/11/2023", totalVisits: 3,  status: "active" },
  { id: "p15", code: "BN-2023-1690", name: "Tạ Quang Minh",     age: 46, gender: "male",   phone: "078 345 6789", initials: "TM", bloodType: "B-",  lastVisitDate: "10/11/2023", totalVisits: 11, status: "active" },
]

const MOCK_STATS = {
  total: 1284,
  newThisMonth: 42,
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DoctorPatientsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-0">
      {/* Page Header */}
      <section className="relative bg-surface-container pb-20 pt-10 overflow-hidden rounded-3xl mb-0">
        <div className="absolute inset-0 bg-primary/[0.03] -z-10 diagonal-bg-login" />
        <div className="px-8 max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-sm font-semibold rounded-full mb-4">
                Quản lý lâm sàng
              </span>
              <h1 className="text-4xl font-bold text-on-surface">Danh sách Bệnh nhân</h1>
              <p className="text-on-surface-variant text-lg max-w-xl mt-3">
                Quản lý hồ sơ, lịch sử khám bệnh và thông tin liên lạc của bệnh nhân tập trung tại một nơi.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-xl border border-outline-variant clinical-shadow text-center min-w-[120px]">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Tổng số</p>
                <p className="text-2xl font-bold text-primary mt-1">{MOCK_STATS.total.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-outline-variant clinical-shadow text-center min-w-[120px]">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Tháng này</p>
                <p className="text-2xl font-bold text-tertiary mt-1">+{MOCK_STATS.newThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="-mt-10 relative z-10 pb-8">
        <PatientListTable patients={MOCK_PATIENTS} stats={MOCK_STATS} />
      </section>
    </div>
  )
}
