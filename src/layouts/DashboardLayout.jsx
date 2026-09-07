import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import CommandPalette from "../components/CommandPalette"
export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] =
    useState(false)

  return (
    <div className="min-h-screen bg-slate-50">

      <CommandPalette />

      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="lg:ml-[260px] min-h-screen">

        <Topbar
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <main className="min-h-[calc(100vh-72px)] p-4 md:p-6">
          <Outlet />
        </main>

      </div>

    </div>
  )
}