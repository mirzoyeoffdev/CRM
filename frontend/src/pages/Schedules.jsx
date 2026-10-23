import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { getGroups } from '../api/groups'
import { getGroupSchedule, createSchedule, deleteSchedule } from '../api/schedules'
import Modal from '../components/Modal'
import { Spinner, EmptyState, PageHeader } from '../components/ui'
import { weekdayLabels } from '../utils/constants'

function ScheduleForm({ groupId, onSubmit, loading, error }) {
  const { register, handleSubmit } = useForm()
  return (
    <form onSubmit={handleSubmit(d => onSubmit({ ...d, group_id: Number(groupId), weekday: Number(d.weekday) }))} className="space-y-4">
      <div>
        <label className="label">Hafta kuni *</label>
        <select className="input" {...register('weekday', { required: true })}>
          {Object.entries(weekdayLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Boshlanish vaqti *</label>
          <input className="input" type="time" {...register('start_time', { required: true })} />
        </div>
        <div>
          <label className="label">Tugash vaqti *</label>
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

export default function Schedules() {
  const qc = useQueryClient()
  const [groupId, setGroupId] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: getGroups })
  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ['schedule', groupId],
    queryFn: () => getGroupSchedule(groupId),
    enabled: !!groupId,
  })

  const addMut = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => { qc.invalidateQueries(['schedule', groupId]); setAddOpen(false) },
  })
  const delMut = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => qc.invalidateQueries(['schedule', groupId]),
  })

  // Haftalik jadval ko'rinishi
  const days = [1, 2, 3, 4, 5, 6, 7]
  const scheduleMap = Object.fromEntries(schedule.map(s => [s.weekday, s]))

  return (
    <div className="p-6">
      <PageHeader
        title="Dars jadvali"
        action={
          groupId && (
            <button className="btn-primary" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4" /> Dars qo'shish
            </button>
          )
        }
      />

      <div className="mb-6 max-w-xs">
        <label className="label">Guruh tanlang</label>
        <select className="input" value={groupId} onChange={e => setGroupId(e.target.value)}>
          <option value="">— Guruh tanlang —</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      {!groupId ? (
        <div className="card p-12 text-center text-gray-400">Guruh tanlang</div>
      ) : isLoading ? <Spinner /> : (
        <>
          {/* Haftalik grid ko'rinishi */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {days.map(d => {
              const entry = scheduleMap[d]
              const isToday = new Date().getDay() === (d === 7 ? 0 : d)
              return (
                <div key={d} className={`card p-3 text-center ${isToday ? 'border-blue-300 bg-blue-50' : ''}`}>
                  <p className={`text-xs font-semibold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {weekdayLabels[d].slice(0, 3)}
                  </p>
                  {entry ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.start_time}</p>
                      <p className="text-xs text-gray-500">—</p>
                      <p className="text-sm font-medium text-gray-900">{entry.end_time}</p>
                      {entry.room && <p className="text-xs text-gray-400 mt-1">#{entry.room}</p>}
                      <button className="mt-2 text-red-400 hover:text-red-600" onClick={() => delMut.mutate(entry.id)}>
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-300">—</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* List ko'rinishi */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Jadval ro'yxati</h3>
            </div>
            {schedule.length === 0 ? (
              <EmptyState text="Jadval kiritilmagan" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="table-th">Kun</th>
                    <th className="table-th">Boshlanish</th>
                    <th className="table-th">Tugash</th>
                    <th className="table-th">Xona</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...schedule].sort((a, b) => a.weekday - b.weekday).map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="table-td font-medium">{weekdayLabels[s.weekday]}</td>
                      <td className="table-td">{s.start_time}</td>
                      <td className="table-td">{s.end_time}</td>
                      <td className="table-td text-gray-500">{s.room || '—'}</td>
                      <td className="table-td">
                        <button className="text-gray-400 hover:text-red-600" onClick={() => delMut.mutate(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Jadvalga dars qo'shish">
        <ScheduleForm
          groupId={groupId}
          onSubmit={data => addMut.mutate(data)}
          loading={addMut.isPending}
          error={addMut.error?.response?.data?.detail}
        />
      </Modal>
    </div>
  )
}
