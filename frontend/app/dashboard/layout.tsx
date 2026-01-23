export const metadata = {
  title: 'Dashboard - InstaPrint',
  description: 'Manage your printing jobs and account',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cream-50">
      {children}
    </div>
  )
}