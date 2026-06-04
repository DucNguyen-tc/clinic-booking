export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-margin-mobile md:p-margin-desktop bg-surface-container-low min-h-screen">
      {children}
    </div>
  )
}
