import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#080B14] relative">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
