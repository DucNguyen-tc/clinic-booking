"use client"

import { useFieldArray, Control } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { nanoid } from "nanoid"
import type { MedicalRecordFormData } from "@/types/medical-record"

interface PrescriptionTableProps {
  control: Control<MedicalRecordFormData>
}

export function PrescriptionTable({ control }: PrescriptionTableProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "prescriptions",
  })

  const addRow = () => {
    append({
      id: nanoid(),
      medicationName: "",
      dosage: "",
      quantity: "",
      instructions: "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg text-on-surface">Đơn thuốc chỉ định</h4>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-full font-semibold text-sm hover:bg-primary-fixed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm thuốc
        </button>
      </div>

      <div className="overflow-hidden border border-outline-variant rounded-2xl bg-surface-bright">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-b border-outline-variant">
              <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tên thuốc</th>
              <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Liều lượng</th>
              <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-24">Số lượng</th>
              <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cách dùng</th>
              <th className="p-4 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-on-surface-variant opacity-60">
                  Chưa có thuốc nào. Nhấn &quot;Thêm thuốc&quot; để bắt đầu kê đơn.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-3">
                    <input
                      {...control.register(`prescriptions.${index}.medicationName`)}
                      className="w-full bg-transparent border border-transparent focus:border-primary focus:ring-0 focus:bg-surface-container-low rounded-lg px-2 py-1 text-sm text-on-surface outline-none transition-all"
                      placeholder="Tên thuốc..."
                    />
                  </td>
                  <td className="p-3">
                    <input
                      {...control.register(`prescriptions.${index}.dosage`)}
                      className="w-full bg-transparent border border-transparent focus:border-primary focus:ring-0 focus:bg-surface-container-low rounded-lg px-2 py-1 text-sm text-on-surface outline-none transition-all"
                      placeholder="Liều lượng..."
                    />
                  </td>
                  <td className="p-3">
                    <input
                      {...control.register(`prescriptions.${index}.quantity`)}
                      className="w-full bg-transparent border border-transparent focus:border-primary focus:ring-0 focus:bg-surface-container-low rounded-lg px-2 py-1 text-sm text-on-surface outline-none transition-all"
                      placeholder="0"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      {...control.register(`prescriptions.${index}.instructions`)}
                      className="w-full bg-transparent border border-transparent focus:border-primary focus:ring-0 focus:bg-surface-container-low rounded-lg px-2 py-1 text-sm text-on-surface outline-none transition-all"
                      placeholder="Cách dùng..."
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-error hover:bg-error-container/20 p-1.5 rounded-full transition-colors"
                      title="Xóa thuốc"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
