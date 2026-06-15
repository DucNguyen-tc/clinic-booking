'use client'

import * as Icons from 'lucide-react'
import type { PatientSpecialty } from '@/types/patient-booking'

interface SpecialtyCardProps {
  specialty: PatientSpecialty
  isSelected: boolean
  onSelect: (id: string | null) => void
}

export default function SpecialtyCard({ specialty, isSelected, onSelect }: SpecialtyCardProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[specialty.iconName]

  return (
    <div
      onClick={() => onSelect(isSelected ? null : specialty.id)}
      className={`group p-6 rounded-2xl clinical-shadow border transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
        isSelected
          ? 'bg-primary border-primary text-white scale-105'
          : 'bg-white border-outline-variant/10 hover:border-primary/50 text-on-surface'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all ${
          isSelected
            ? 'bg-white/20 text-white'
            : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'
        }`}
      >
        {IconComponent && <IconComponent className="w-7 h-7" />}
      </div>

      <h3 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-on-surface'}`}>
        {specialty.name}
      </h3>

      <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-on-surface-variant'}`}>
        {specialty.count > 0 ? `${specialty.count} Bác sĩ` : 'Chuyên khoa'}
      </p>
    </div>
  )
}
