import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { getGroups } from '../api/groups'
import { getGroupStudents } from '../api/groups'
import { getGroupAttendance, markAttendance, updateAttendance } from '../api/attendance'
import { Spinner, ErrorMessage, PageHeader } from '../components/ui'
import { attendanceLabels, attendanceColors } from '../utils/constants'
import Badge from '../components/Badge'

const STATUS_ICONS = {
  present: <CheckCircle className="w-4 h-4 text-green-500" />,
  absent: <XCircle className="w-4 h-4 text-red-500" />,
  late: <Clock className="w-4 h-4 text-yellow-500" />,
  excused: <AlertCircle className="w-4 h-4 text-gray-400" />,
}

const STATUSES = ['present', 'absent', 'late', 'excused']

export default function Attendance() {
  const [groupId, setGroupId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const qc = useQueryClient()

  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: getGroups })
  const { data: groupStudents } = useQuery({
    queryKey: ['groupStudents', groupId],
    queryFn: () => getGroupStudents(groupId),
    enabled: !!groupId,
  })
  const { data: todayAtt = [], isLoading: attLoading } = useQuery({
    queryKey: ['groupAtt', groupId, date],
    queryFn: () => getGroupAttendance(groupId, { attendance_date: date }),
    enabled: !!groupId,
  })

  const markMut = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => qc.invalidateQueries(['groupAtt', groupId, date]),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, status }) => updateAttendance(id, { status }),
    onSuccess: () => qc.invalidateQueries(['groupAtt', groupId, date]),
  })

  const attMap = Object.fromEntries(todayAtt.map(a => [a.student_id, a]))
  const students = groupStudents?.students || []

  function handleStatus(studentId, status) {
    const existing = attMap[studentId]
    if (existing) {
      updateMut.mutate({ id: existing.id, status })
    } else {
      markMut.mutate({ student_id: studentId, group_id: Number(groupId), date, status })
    }
  }

  const marked = Object.keys(attMap).length
  const total = students.length

  return (
    <div className="p-6">
      <PageHeader title="Davomat" subtitle="Kunlik davomat belgilash" />

      {/* Filtrlar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <label className="label">Guruh</label>
          <select className="input" value={groupId} onChange={e => setGroupId(e.target.value)}>
            <option value="">— Guruh tanlang —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Sana</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {!groupId ? (
        <div className="card p-12 text-center text-gray-400">
          Guruh va sanani tanlang
        </div>
      ) : attLoading ? <Spinner /> : (
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
            <p className="text-sm text-gray-600">
              {date} — <span className="font-medium">{marked}/{total}</span> belgilangan
            </p>
            {total > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(marked / total) * 100}%` }} />
                </div>
                <span className="text-gray-500">{Math.round((marked / total) * 100)}%</span>
              </div>
            )}
          </div>

          {students.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Bu guruhda o'quvchi yo'q</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b">
                  <th className="table-th">O'quvchi</th>
                  <th className="table-th">Telefon</th>
                  <th className="table-th">Holat</th>
                  <th className="table-th">Belgilash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(s => {
                  const att = attMap[s.id]
                  const isPending = markMut.isPending || updateMut.isPending
                  return (
                    <tr key={s.id} className={`hover:bg-gray-50 ${att ? '' : 'opacity-80'}`}>
                      <td className="table-td font-medium">{s.full_name}</td>
                      <td className="table-td text-gray-500 text-xs">{s.phone}</td>
                      <td className="table-td">
                        {att ? (
                          <div className="flex items-center gap-1.5">
                            {STATUS_ICONS[att.status]}
                            <Badge label={attendanceLabels[att.status]} colorClass={attendanceColors[att.status]} />
                          </div>
                        ) : <span className="text-gray-300 text-xs">Belgilanmagan</span>}
                      </td>
                      <td className="table-td">
                        <div className="flex gap-1">
                          {STATUSES.map(st => (
                            <button
                              key={st}
                              disabled={isPending}
                              onClick={() => handleStatus(s.id, st)}
                              className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                                att?.status === st
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
                              }`}
                            >
                              {attendanceLabels[st].slice(0, 4)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
