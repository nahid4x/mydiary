'use client'

import { Sidebar } from './sidebar'
import { AppNavbar } from './navbar'

export function AppShell({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#faf7f2]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppNavbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
