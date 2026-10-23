import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  CreditCard, Star, Calendar, BarChart3, GraduationCap
} from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Bosh sahifa' },
  { to: '/students', icon: Users, label: "O'quvchilar" },
  { to: '/groups', icon: BookOpen, label: 'Guruhlar' },
  { to: '/attendance', icon: ClipboardList, label: 'Davomat' },
  { to: '/payments', icon: CreditCard, label: "To'lovlar" },
  { to: '/grades', icon: Star, label: 'Baholar' },
  { to: '/schedules', icon: Calendar, label: 'Jadval' },
  { to: '/reports', icon: BarChart3, label: 'Hisobotlar' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-gray-900 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <GraduationCap className="w-8 h-8 text-blue-400" />
        <div>
          <p className="text-white font-bold text-sm leading-tight">English Course</p>
          <p className="text-gray-400 text-xs">CRM Tizimi</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-gray-500 text-xs">v1.0.0</p>
      </div>
    </aside>
  )
}
