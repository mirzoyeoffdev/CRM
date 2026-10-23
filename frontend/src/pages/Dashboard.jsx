import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, CreditCard, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import StatCard from '../components/StatCard'
import { Spinner, ErrorMessage } from '../components/ui'
import { getOverview, getMonthlyRevenue, getGroupStats } from '../api/reports'
import { formatMoney, monthNames } from '../utils/constants'

export default function Dashboard() {
  const year = new Date().getFullYear()
  const { data: overview, isLoading, error } = useQuery({ queryKey: ['overview'], queryFn: getOverview })
  const { data: revenue } = useQuery({ queryKey: ['revenue', year], queryFn: () => getMonthlyRevenue(year) })
  const { data: groupStats } = useQuery({ queryKey: ['groupStats'], queryFn: getGroupStats })

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={error.message} />

  const chartData = revenue?.monthly?.map(m => ({
    name: monthNames[m.month - 1].slice(0, 3),
    summa: m.revenue,
  })) || []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bosh sahifa</h1>
        <p className="text-gray-500 text-sm mt-1">{year}-yil statistikasi</p>
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Jami o'quvchilar" value={overview.total_students} sub={`${overview.active_students} ta faol`} color="blue" />
        <StatCard icon={BookOpen} label="Guruhlar" value={overview.total_groups} sub={`${overview.active_enrollments} ta yozilish`} color="purple" />
        <StatCard icon={CreditCard} label="Jami daromad" value={formatMoney(overview.total_revenue_som)} color="green" />
        <StatCard icon={TrendingUp} label="Faol yozilishlar" value={overview.active_enrollments} color="orange" />
      </div>

      {/* Oylik daromad grafigi */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{year}-yil oylik daromad</h2>
        {chartData.some(d => d.summa > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Bar dataKey="summa" name="Daromad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Hali to'lov ma'lumotlari yo'q</p>
        )}
      </div>

      {/* Guruhlar jadvali */}
      {groupStats && groupStats.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-base font-semibold text-gray-900">Guruhlar holati</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Guruh</th>
                <th className="table-th">O'qituvchi</th>
                <th className="table-th">O'quvchilar</th>
                <th className="table-th">Davomat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupStats.map(g => (
                <tr key={g.group_id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{g.group_name}</td>
                  <td className="table-td text-gray-500">{g.teacher}</td>
                  <td className="table-td">
                    <span className={g.student_count >= g.max_students ? 'text-red-600 font-medium' : ''}>
                      {g.student_count}/{g.max_students}
                    </span>
                  </td>
                  <td className="table-td">
                    {g.attendance_rate !== null
                      ? <span className={g.attendance_rate >= 80 ? 'text-green-600' : g.attendance_rate >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                          {g.attendance_rate}%
                        </span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
