import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { getOverview, getMonthlyRevenue, getGroupStats } from '../api/reports'
import { Spinner, ErrorMessage, PageHeader } from '../components/ui'
import { formatMoney, monthNames } from '../utils/constants'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Reports() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const { data: overview, isLoading: ovLoading } = useQuery({ queryKey: ['overview'], queryFn: getOverview })
  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ['revenue', year], queryFn: () => getMonthlyRevenue(year)
  })
  const { data: groupStats, isLoading: gsLoading } = useQuery({ queryKey: ['groupStats'], queryFn: getGroupStats })

  if (ovLoading || gsLoading) return <Spinner />

  const chartData = revenue?.monthly?.map(m => ({
    name: monthNames[m.month - 1].slice(0, 3),
    summa: m.revenue,
  })) || []

  const pieData = (groupStats || []).map(g => ({
    name: g.group_name,
    value: g.student_count,
  })).filter(g => g.value > 0)

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Hisobotlar" subtitle="Umumiy statistika va tahlil" />

      {/* Umumiy raqamlar */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Jami o'quvchilar", value: overview.total_students, color: 'text-blue-600' },
            { label: 'Faol o\'quvchilar', value: overview.active_students, color: 'text-green-600' },
            { label: 'Guruhlar', value: overview.total_groups, color: 'text-purple-600' },
            { label: 'Jami daromad', value: formatMoney(overview.total_revenue_som), color: 'text-emerald-600' },
          ].map(item => (
            <div key={item.label} className="card p-5 text-center">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Oylik daromad */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Oylik daromad</h2>
          <select
            className="input w-28 text-sm"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {revLoading ? <Spinner /> : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              Jami: <span className="font-semibold text-gray-900">{formatMoney(revenue?.total_revenue || 0)}</span>
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v} />
                <Tooltip formatter={v => formatMoney(v)} />
                <Bar dataKey="summa" name="Daromad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guruhlar bo'yicha o'quvchilar (Pie) */}
        {pieData.length > 0 && (
          <div className="card p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Guruhlar bo'yicha o'quvchilar</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Guruhlar jadvali */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="text-base font-semibold text-gray-900">Guruhlar holati</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Guruh</th>
                <th className="table-th">O'quvchi</th>
                <th className="table-th">Davomat</th>
                <th className="table-th">Oylik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(groupStats || []).map(g => (
                <tr key={g.group_id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{g.group_name}</td>
                  <td className="table-td">
                    <span className={g.student_count >= g.max_students ? 'text-red-600 font-medium' : 'text-gray-700'}>
                      {g.student_count}/{g.max_students}
                    </span>
                  </td>
                  <td className="table-td">
                    {g.attendance_rate !== null ? (
                      <span className={g.attendance_rate >= 80 ? 'text-green-600' : g.attendance_rate >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                        {g.attendance_rate}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="table-td text-xs text-gray-500">{formatMoney(g.monthly_fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
