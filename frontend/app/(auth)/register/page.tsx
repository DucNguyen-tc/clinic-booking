import Image from "next/image"
import { RegisterForm } from "@/components/auth/register-form"
import { Stethoscope } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[1200px] min-h-[760px] flex flex-col md:flex-row rounded-2xl overflow-hidden clinical-shadow-lg border border-outline-variant/30">
      {/* Left Side: Illustration & Branding (Clinical Light Canvas) */}
      <div className="hidden md:flex w-1/2 bg-surface-container-low flex-col items-center justify-center p-12 md:p-20 relative overflow-hidden">
        {/* Decorative Dots */}
        <div className="absolute top-10 left-10 grid grid-cols-3 gap-3 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-primary" />
          ))}
        </div>
        
        {/* Branding & Subtext */}
        <div className="text-center mb-8 z-10">
          <h2 className="font-headline-xl text-4xl font-bold text-primary tracking-tight mb-3">MediBook</h2>
          <p className="font-body-lg text-lg text-on-surface-variant max-w-xs md:max-w-sm mx-auto">
            Giải pháp quản lý sức khỏe hiện đại và tận tâm.
          </p>
        </div>
        
        {/* Illustration Area */}
        <div className="relative w-full max-w-sm aspect-square flex items-center justify-center z-10 transition-all hover:scale-105 duration-500">
          <Image
            src="/images/register-illustration.png"
            alt="Medical Professional Illustration"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Background Decorative Shape */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Right Side: Dark Themed Registration Form (Inverse Surface) */}
      <div className="w-full md:w-1/2 bg-inverse-surface p-12 md:p-20 flex flex-col justify-center">
        <RegisterForm />
      </div>

      {/* Presentation Tag */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-surface px-4 py-2 rounded-full clinical-shadow border border-outline-variant/20 hidden md:flex">
        <span className="font-caption text-xs text-on-surface-variant">presented by</span>
        <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-on-primary" />
        </div>
      </div>
    </div>
  )
}
