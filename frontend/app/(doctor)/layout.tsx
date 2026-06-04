import type { ReactNode } from "react"
import { DoctorSidebar } from "@/components/doctor/sidebar"
import { DoctorTopBar } from "@/components/doctor/topbar"

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DoctorSidebar />
      <DoctorTopBar />
      <main className="ml-64 mt-16 p-6 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  )
}
