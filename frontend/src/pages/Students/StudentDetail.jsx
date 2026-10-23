import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { getStudentFullReport } from '../../api/reports'
import { Spinner, ErrorMessage } from '../../components/ui'
import Badge from '../../components/Badge'
import { formatMoney, formatDate } from '../../utils/constants'

export default function StudentDetail() {
  const { id } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['studentReport', id],
    queryFn: () => getStudentFullReport(id),
  })

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={error.message} />

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <Link to="/students" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft className="w-4 h-4" /> O'quvchilar ro'yxatiga qaytish
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.full_name}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              {data.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{data.phone}</span>}
            </div>
          </div>
          <Badge
            label={data.is_active ? 'Faol' : 'Nofaol'}
            colorClass={data.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
          />
        </div>
      </div>

      {/* Groups */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Guruhlar</h2>
        {data.groups.length === 0 ? (
          <div className="card p-8 text-center text-gray-400 text-sm">Hech qaysi guruhga yozilmagan</div>
        ) : (
          <div className="space-y-4">
            {data.groups.map(g => (
              <div key={g.group_id} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{g.group_name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Boshlanish: {formatDate(g.start_date)}</p>
                  </div>
                  <Badge
                    label={g.enrollment_active ? 'Faol' : 'Tugatgan'}
                    colorClass={g.enrollment_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Davomatlilik</p>
                    <p className={`text-xl font-bold ${
                      g.attendance_rate === null ? 'text-gray-400'
                      : g.attendance_rate >= 80 ? 'text-green-600'
                      : g.attendance_rate >= 60 ? 'text-yellow-600'
                      : 'text-red-600'
                    }`}>
                      {g.attendance_rate !== null ? `${g.attendance_rate}%` : '—'}
                    </p>
                    <p className="text-xs text-gray-400">{g.total_lessons} dars</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Jami to'lov</p>
                    <p className="text-lg font-bold text-green-600">{formatMoney(g.total_paid_som)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Daraja</p>
                    <p className="text-base font-semibold text-gray-700">{g.level}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
