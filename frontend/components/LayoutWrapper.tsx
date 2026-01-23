import * as React from "react"
import { Navbar } from "@/components/Navbar"

interface LayoutWrapperProps {
  children: React.ReactNode
  userType?: string
}

export function LayoutWrapper({ children, userType }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #FEF2F2 100%)',
      minHeight: '100vh'
    }}>
      <Navbar userType={userType === 'user' ? 'user' : 'vendor'} />
      <main>
        {children}
      </main>
    </div>
  )
}