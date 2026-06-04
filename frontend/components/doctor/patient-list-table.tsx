"use client"

import { useState, useMemo } from "react"
import { Search, CalendarDays, Filter, FileText, Send, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PatientRecord, PatientFilter, PatientGender } from "@/types/patient"

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10

const AVATAR_COLORS = [
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-primary-fixed text-on-primary-fixed",
  "bg-surface-container-highest text-on-surface",
]

// ── Filter Bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  filter: PatientFilter
  onChange: (filter: PatientFilter) => void
}

function FilterBar({ filter, onChange }: FilterBarProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-outline-variant clinical-shadow flex flex-wrap items-end gap-6">
      {/* Search */}
      <div className="flex-1 min-w-[280px]">
        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2 ml-1 tracking-wider">
          Tìm kiếm theo tên
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onChange({ ...filter, searchQuery: e.target.value })}
            placeholder="Nhập tên bệnh nhân hoặc mã số..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* Date */}
      <div className="w-48">
        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2 ml-1 tracking-wider">
          Ngày khám
        </label>
        <div className="relative">
          <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="date"
            value={filter.dateFrom ?? ""}
            onChange={(e) => onChange({ ...filter, dateFrom: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
          />
        </div>
      </div>

      {/* Apply */}
      <button className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95">
        <Filter className="w-4 h-4" />
        Áp dụng
      </button>
    </div>
  )
}

// ── Table Row ─────────────────────────────────────────────────────────────────

function PatientRow({ patient, index }: { patient: PatientRecord; index: number }) {
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length]

  return (
    <tr className="hover:bg-surface-container-low/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0", colorClass)}>
            {patient.initials}
          </div>
          <div>
            <p className="font-semibold text-on-surface text-sm">{patient.name}</p>
            <p className="text-xs text-on-surface-variant">MS: {patient.code}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant">
        {patient.age} / {patient.gender === "male" ? "Nam" : patient.gender === "female" ? "Nữ" : "Khác"}
      </td>
      <td className="px-6 py-4 text-sm text-on-surface-variant">{patient.phone}</td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-container/10 text-primary">
          {patient.lastVisitDate}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-on-surface">
        {String(patient.totalVisits).padStart(2, "0")} lần
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center gap-2">
          <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Xem hồ sơ">
            <FileText className="w-4 h-4" />
          </button>
          <button className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="Gửi nhắc lịch">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems)

  const pages = useMemo(() => {
    const arr: (number | "ellipsis")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) arr.push(i)
    } else {
      arr.push(1)
      if (currentPage > 3) arr.push("ellipsis")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        arr.push(i)
      }
      if (currentPage < totalPages - 2) arr.push("ellipsis")
      arr.push(totalPages)
    }
    return arr
  }, [currentPage, totalPages])

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
      <p className="text-sm text-on-surface-variant">
        Hiển thị {start} - {end} trong {totalItems.toLocaleString()} bệnh nhân
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="px-2 text-on-surface-variant">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all",
                p === currentPage
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface PatientListTableProps {
  patients: PatientRecord[]
  stats: { total: number; newThisMonth: number }
}

export function PatientListTable({ patients, stats }: PatientListTableProps) {
  const [filter, setFilter] = useState<PatientFilter>({
    searchQuery: "",
    gender: "all",
    status: "all",
  })
  const [page, setPage] = useState(1)

  // Client-side filter
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false
      }
      if (filter.gender !== "all" && p.gender !== filter.gender) return false
      if (filter.status !== "all" && p.status !== filter.status) return false
      return true
    })
  }, [patients, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageSlice = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar filter={filter} onChange={(f) => { setFilter(f); setPage(1) }} />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline-variant clinical-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-6 py-4 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Tuổi/Giới</th>
                <th className="px-6 py-4 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Số điện thoại</th>
                <th className="px-6 py-4 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Ngày khám gần nhất</th>
                <th className="px-6 py-4 font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Tổng số lần</th>
                <th className="px-6 py-4 font-semibold text-xs text-on-surface-variant uppercase tracking-wider text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {pageSlice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-on-surface-variant opacity-60">
                    Không tìm thấy bệnh nhân nào phù hợp.
                  </td>
                </tr>
              ) : (
                pageSlice.map((patient, index) => (
                  <PatientRow key={patient.id} patient={patient} index={index} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        onPageChange={setPage}
      />
    </div>
  )
}
