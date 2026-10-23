import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Plus, Trash2, UserPlus } from 'lucide-react'
import { getGroup, getGroupStudents } from '../../api/groups'
import { getGroupAttendanceSummary } from '../../api/attendance'
import { getGroupSchedule, createSchedule, deleteSchedule } from '../../api/schedules'
import { createEnrollment, deleteEnrollment } from '../../api/enrollments'
import { getStudents } from '../../api/students'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import { Spinner, ErrorMessage, ConfirmDialog } from '../../components/ui'
import { levelLabels, levelColors, formatMoney, weekdayLabels, getAttendanceRateColor } from '../../utils/constants'

export default function GroupDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [removeEnrollId, setRemoveEnrollId] = useState(null)

  const { data: group, isLoading } = useQuery({ queryKey: ['group', id], queryFn: () => getGroup(id) })
  const { data: groupStudents } = useQuery({ queryKey: ['groupStudents', id], queryFn: () => getGroupStudents(id) })
  const { data: attSummary } = useQuery({ queryKey: ['attSummary', id], queryFn: () => getGroupAttendanceSummary(id) })
  const { data: schedule } = useQuery({ queryKey: ['schedule', id], queryFn: () => getGroupSchedule(id) })
  const { data: allStudents = [] } = useQuery({ queryKey: ['students'], queryFn: () => getStudents() })

  const enrollMut = useMutation({
    mutationFn: createEnrollment,
    onSuccess: () => { qc.invalidateQueries(['groupStudents', id]); setEnrollOpen(false) },
  })
  const removeEnrollMut = useMutation({
    mutationFn: deleteEnrollment,
    onSuccess: () => { qc.invalidateQueries(['groupStudents', id]); setRemoveEnrollId(null) },
  })
  const addScheduleMut = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => { qc.invalidateQueries(['schedule', id]); setScheduleOpen(false) },
  })
  const delScheduleMut = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => qc.invalidateQueries(['schedule', id]),
  })

  if (isLoading) return <Spinner />
  if (!group) return <ErrorMessage message="Guruh topilmadi" />

  const attMap = Object.fromEntries((attSummary || []).map(a => [a.student_id, a]))

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <Link to="/groups" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft className="w-4 h-4" /> Guruhlar ro'yxatiga qaytish
      </Link>

      {/* Guruh ma'lumotlari */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge label={levelLabels[group.level] || group.level} colorClass={levelColors[group.level] || 'bg-gray-100 text-gray-700'} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{formatMoney(group.monthly_fee)}</p>
            <p className="text-xs text-gray-400">oylik to'lov</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">O'qituvchi: </span><span className="font-medium">{group.teacher_name}</span></div>
          <div><span className="text-gray-500">Max o'quvchi: </span><span className="font-medium">{group.max_students}</span></div>
        </div>
      </div>

      {/* O'quvchilar */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">
            O'quvchilar ({groupStudents?.total_students || 0}/{group.max_students})
          </h2>
          <button className="btn-primary text-xs" onClick={() => setEnrollOpen(true)}>
            <UserPlus className="w-4 h-4" /> Qo'shish
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">Ism Familiya</th>
              <th className="table-th">Telefon</th>
              <th className="table-th">Davomatlilik</th>
              <th className="table-th">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(groupStudents?.students || []).map(s => {
              const att = attMap[s.id]
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <Link to={`/students/${s.id}`} className="font-medium text-blue-600 hover:underline">
                      {s.full_name}
                    </Link>
                  </td>
                  <td className="table-td text-gray-500">{s.phone}</td>
                  <td className="table-td">
                    {att ? (
                      <span className={`font-medium ${getAttendanceRateColor(att.attendance_rate)}`}>
                        {att.attendance_rate}%
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="table-td">
                    <button className="text-gray-400 hover:text-red-600" onClick={() => setRemoveEnrollId(s.enrollment_id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Jadval */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Dars jadvali</h2>
          <button className="btn-primary text-xs" onClick={() => setScheduleOpen(true)}>
            <Plus className="w-4 h-4" /> Qo'shish
          </button>
        </div>
        {!schedule || schedule.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Jadval kiritilmagan</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Kun</th>
                <th className="table-th">Boshlanish</th>
                <th className="table-th">Tugash</th>
                <th className="table-th">Xona</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...schedule].sort((a, b) => a.weekday - b.weekday).map(s => (
                <tr key={s.id}>
                  <td className="table-td font-medium">{weekdayLabels[s.weekday]}</td>
                  <td className="table-td">{s.start_time}</td>
                  <td className="table-td">{s.end_time}</td>
                  <td className="table-td text-gray-500">{s.room || '—'}</td>
                  <td className="table-td">
                    <button className="text-gray-400 hover:text-red-600" onClick={() => delScheduleMut.mutate(s.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Guruhga o'quvchi qo'shish modal */}
      <Modal isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} title="Guruhga o'quvchi qo'shish">
        <EnrollForm
          groupId={Number(id)}
          students={allStudents}
          currentIds={(groupStudents?.students || []).map(s => s.id)}
          onSubmit={data => enrollMut.mutate(data)}
          loading={enrollMut.isPending}
          error={enrollMut.error?.response?.data?.detail}
        />
      </Modal>

      {/* Jadvalga dars qo'shish modal */}
      <Modal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Jadvalga dars qo'shish">
        <ScheduleForm
          groupId={Number(id)}
          onSubmit={data => addScheduleMut.mutate(data)}
          loading={addScheduleMut.isPending}
          error={addScheduleMut.error?.response?.data?.detail}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!removeEnrollId}
        onClose={() => setRemoveEnrollId(null)}
        onConfirm={() => removeEnrollMut.mutate(removeEnrollId)}
        loading={removeEnrollMut.isPending}
        title="O'quvchini guruhdan chiqarish"
        message="Bu o'quvchini guruhdan chiqarishni tasdiqlaysizmi?"
      />
    </div>
  )
}

function EnrollForm({ groupId, students, currentIds, onSubmit, loading, error }) {
  const { register, handleSubmit } = useForm({ defaultValues: { start_date: new Date().toISOString().slice(0, 10) } })
  const available = students.filter(s => s.is_active && !currentIds.includes(s.id))
  return (
    <form onSubmit={handleSubmit(d => onSubmit({ ...d, group_id: groupId, student_id: Number(d.student_id) }))} className="space-y-4">
      <div>
        <label className="label">O'quvchi</label>
        <select className="input" {...register('student_id', { required: true })}>
          <option value="">— Tanlang —</option>
          {available.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} — {s.phone}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Boshlanish sanasi</label>
        <input className="input" type="date" {...register('start_date')} />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Qo\'shilmoqda...' : 'Qo\'shish'}</button>
      </div>
    </form>
  )
}

function ScheduleForm({ groupId, onSubmit, loading, error }) {
  const { register, handleSubmit } = useForm()
  const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7]
  return (
    <form onSubmit={handleSubmit(d => onSubmit({ ...d, group_id: groupId, weekday: Number(d.weekday) }))} className="space-y-4">
      <div>
        <label className="label">Kun</label>
        <select className="input" {...register('weekday', { required: true })}>
          {WEEKDAYS.map(d => <option key={d} value={d}>{weekdayLabels[d]}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Boshlanish</label>
          <input className="input" type="time" {...register('start_time', { required: true })} />
        </div>
        <div>
          <label className="label">Tugash</label>
          <input className="input" type="time" {...register('end_time', { required: true })} />
        </div>
      </div>
      <div>
        <label className="label">Xona</label>
        <input className="input" placeholder="101" {...register('room')} />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </form>
  )
}
