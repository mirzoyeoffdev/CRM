import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { getGroups } from '../api/groups'
import { getStudents } from '../api/students'
import { getStudentGrades, getGroupGradeSummary, createGrade, deleteGrade } from '../api/grades'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { Spinner, EmptyState, PageHeader, ConfirmDialog } from '../components/ui'
import { formatDate, examTypeLabels } from '../utils/constants'

function GradeForm({ students, groups, onSubmit, loading, error }) {
  const { register, handleSubmit } = useForm({
    defaultValues: { max_score: 100, exam_date: new Date().toISOString().slice(0, 10) }
  })
  return (
    <form onSubmit={handleSubmit(d => onSubmit({ ...d, student_id: Number(d.student_id), group_id: Number(d.group_id), score: Number(d.score), max_score: Number(d.max_score) }))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">O'quvchi *</label>
          <select className="input" {...register('student_id', { required: true })}>
            <option value="">— Tanlang —</option>
            {students.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Guruh *</label>
          <select className="input" {...register('group_id', { required: true })}>
            <option value="">— Tanlang —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Imtihon turi</label>
          <select className="input" {...register('exam_type')}>
            {Object.entries(examTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Sana</label>
          <input className="input" type="date" {...register('exam_date')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Ball *</label>
          <input className="input" type="number" step="0.1" {...register('score', { required: true })} />
        </div>
        <div>
          <label className="label">Maksimal ball</label>
          <input className="input" type="number" step="0.1" {...register('max_score')} />
        </div>
      </div>
      <div>
        <label className="label">Izoh</label>
        <input className="input" {...register('note')} />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </form>
  )
}

function ScoreBar({ score, maxScore }) {
  const pct = Math.min((score / maxScore) * 100, 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-gray-200 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-600">{score}/{maxScore}</span>
    </div>
  )
}

export default function Grades() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('grades') // 'grades' | 'summary'
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [filterStudent, setFilterStudent] = useState('')
  const [filterGroup, setFilterGroup] = useState('')

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => getStudents() })
  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: getGroups })
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades', filterStudent],
    queryFn: () => getStudentGrades(filterStudent, filterGroup ? { group_id: filterGroup } : {}),
    enabled: !!filterStudent,
  })
  const { data: summary = [], isLoading: summaryLoading } = useQuery({
    queryKey: ['gradeSummary', filterGroup],
    queryFn: () => getGroupGradeSummary(filterGroup),
    enabled: tab === 'summary' && !!filterGroup,
  })

  const createMut = useMutation({
    mutationFn: createGrade,
    onSuccess: () => { qc.invalidateQueries(['grades']); qc.invalidateQueries(['gradeSummary']); setAddOpen(false) },
  })
  const deleteMut = useMutation({
    mutationFn: deleteGrade,
    onSuccess: () => { qc.invalidateQueries(['grades']); setDeleteId(null) },
  })

  const studentMap = Object.fromEntries(students.map(s => [s.id, `${s.first_name} ${s.last_name}`]))
  const groupMap = Object.fromEntries(groups.map(g => [g.id, g.name]))

  return (
    <div className="p-6">
      <PageHeader
        title="Baholar"
        action={
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Baho kiritish
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {[['grades', 'Baholar'], ['summary', "O'rtacha ball"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'grades' ? (
        <>
          {/* Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 max-w-xs">
              <label className="label">O'quvchi</label>
              <select className="input" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
                <option value="">— Tanlang —</option>
                {students.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
              </select>
            </div>
          </div>

          {!filterStudent ? (
            <div className="card p-12 text-center text-gray-400">O'quvchi tanlang</div>
          ) : isLoading ? <Spinner /> : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="table-th">Tur</th>
                    <th className="table-th">Guruh</th>
                    <th className="table-th">Ball</th>
                    <th className="table-th">Sana</th>
                    <th className="table-th">Izoh</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {grades.length === 0 ? (
                    <tr><td colSpan={6}><EmptyState text="Baholar topilmadi" /></td></tr>
                  ) : grades.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="table-td"><Badge label={examTypeLabels[g.exam_type]} colorClass="bg-indigo-100 text-indigo-700" /></td>
                      <td className="table-td text-gray-500">{groupMap[g.group_id] || `#${g.group_id}`}</td>
                      <td className="table-td"><ScoreBar score={g.score} maxScore={g.max_score} /></td>
                      <td className="table-td text-gray-500">{formatDate(g.exam_date)}</td>
                      <td className="table-td text-gray-400 text-xs">{g.note || '—'}</td>
                      <td className="table-td">
                        <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteId(g.id)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Summary - guruh bo'yicha */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 max-w-xs">
              <label className="label">Guruh</label>
              <select className="input" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                <option value="">— Tanlang —</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          {!filterGroup ? (
            <div className="card p-12 text-center text-gray-400">Guruh tanlang</div>
          ) : summaryLoading ? <Spinner /> : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="table-th">#</th>
                    <th className="table-th">O'quvchi</th>
                    <th className="table-th">Imtihonlar soni</th>
                    <th className="table-th">O'rtacha ball</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.length === 0 ? (
                    <tr><td colSpan={4}><EmptyState text="Ma'lumot topilmadi" /></td></tr>
                  ) : summary.map((s, i) => (
                    <tr key={s.student_id} className="hover:bg-gray-50">
                      <td className="table-td text-gray-400">{i + 1}</td>
                      <td className="table-td font-medium">{s.student_name}</td>
                      <td className="table-td text-gray-500">{s.total_exams}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${s.average_score >= 80 ? 'bg-green-500' : s.average_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.average_score}%` }} />
                          </div>
                          <span className={`font-semibold ${s.average_score >= 80 ? 'text-green-600' : s.average_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {s.average_score}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Baho kiritish" size="lg">
        <GradeForm
          students={students} groups={groups}
          onSubmit={data => createMut.mutate(data)}
          loading={createMut.isPending}
          error={createMut.error?.response?.data?.detail}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)} loading={deleteMut.isPending}
        title="Bahoni o'chirish" message="Bu bahoni o'chirishni tasdiqlaysizmi?"
      />
    </div>
  )
}
