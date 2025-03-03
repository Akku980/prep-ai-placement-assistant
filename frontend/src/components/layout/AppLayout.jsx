import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'

export default function AppLayout() {
  const [key, setKey] = useState(0)
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      <Sidebar onNewChat={() => setKey(k => k + 1)} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet key={key} />
      </main>
    </div>
  )
}
