import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { getPayments, createPayment, deletePayment, getDebtors } from '../api/payments'
import { getStudents } from '../api/students'
import { getGroups } from '../api/groups'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { Spinner, ErrorMessage, EmptyState, PageHeader, ConfirmDialog } from '../components/ui'
import { formatMoney, formatDate, paymentMethodLabels, monthNames } from '../utils/constants'

function PaymentForm({ students, groups, onSubmit, loading, error }) {
  const today = new Date()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      payment_date: today.toISOString().slice(0, 10),
      period_year: today.getFullYear(),
      period_month: today.getMonth() + 1,
      payment_method: 'cash',
    }
  })
  return (
    <form onSubmit={handleSubmit(d => onSubmit({ ...d, student_id: Number(d.student_id), group_id: Number(d.group_id), amount: Number(d.amount), period_year: Number(d.period_year), period_month: Number(d.period_month) }))} className="space-y-4">
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Summa (so'm) *</label>
          <input className="input" type="number" placeholder="500000" {...register('amount', { required: true })} />
        </div>
        <div>
          <label className="label">To'lov turi</label>
          <select className="input" {...register('payment_method')}>
            {Object.entries(paymentMethodLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Sana</label>
          <input className="input" type="date" {...register('payment_date')} />
        </div>
        <div>
          <label className="label">Yil</label>
          <input className="input" type="number" {...register('period_year')} />
        </div>
        <div>
          <label className="label">Oy</label>
          <select className="input" {...register('period_month')}>
            {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
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

export default function Payments() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('all') // 'all' | 'debtors'
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const today = new Date()
  const [debtYear, setDebtYear] = useState(today.getFullYear())
  const [debtMonth, setDebtMonth] = useState(today.getMonth() + 1)

  const { data: payments = [], isLoading } = useQuery({ queryKey: ['payments'], queryFn: getPayments })
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => getStudents() })
  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: getGroups })
  const { data: debtors = [], isLoading: debtLoading } = useQuery({
    queryKey: ['debtors', debtYear, debtMonth],
    queryFn: () => getDebtors({ year: debtYear, month: debtMonth }),
    enabled: tab === 'debtors',
  })

  const createMut = useMutation({
    mutationFn: createPayment,
    onSuccess: () => { qc.invalidateQueries(['payments']); setAddOpen(false) },
  })
  const deleteMut = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => { qc.invalidateQueries(['payments']); setDeleteId(null) },
  })

  const studentMap = Object.fromEntries(students.map(s => [s.id, `${s.first_name} ${s.last_name}`]))
  const groupMap = Object.fromEntries(groups.map(g => [g.id, g.name]))

  return (
    <div className="p-6">
      <PageHeader
        title="To'lovlar"
        action={
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> To'lov kiritish
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {[['all', "Barcha to'lovlar"], ['debtors', 'Qarzdorlar']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {key === 'debtors' && <AlertTriangle className="w-4 h-4 inline mr-1 text-orange-500" />}
            {label}
          </button>
        ))}
      </div>

      {tab === 'all' ? (
        isLoading ? <Spinner /> : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="table-th">O'quvchi</th>
                  <th className="table-th">Guruh</th>
                  <th className="table-th">Summa</th>
                  <th className="table-th">To'lov turi</th>
                  <th className="table-th">Davr</th>
                  <th className="table-th">Sana</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState text="Hali to'lov kiritilmagan" /></td></tr>
                ) : payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-td font-medium">{studentMap[p.student_id] || `#${p.student_id}`}</td>
                    <td className="table-td text-gray-500">{groupMap[p.group_id] || `#${p.group_id}`}</td>
                    <td className="table-td font-semibold text-green-600">{formatMoney(p.amount)}</td>
                    <td className="table-td"><Badge label={paymentMethodLabels[p.payment_method]} colorClass="bg-gray-100 text-gray-700" /></td>
                    <td className="table-td text-gray-500">{monthNames[p.period_month - 1]} {p.period_year}</td>
                    <td className="table-td text-gray-500">{formatDate(p.payment_date)}</td>
                    <td className="table-td">
                      <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div>
          {/* Qarzdorlar filtri */}
          <div className="flex gap-4 mb-4">
            <div>
              <label className="label">Yil</label>
              <input className="input w-28" type="number" value={debtYear} onChange={e => setDebtYear(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Oy</label>
              <select className="input" value={debtMonth} onChange={e => setDebtMonth(Number(e.target.value))}>
                {monthNames.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
          </div>
          {debtLoading ? <Spinner /> : (
            <div className="card overflow-hidden">
              {debtors.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-2 text-green-600">
                  <span className="text-4xl">✅</span>
                  <p className="font-medium">Barcha to'lovlar amalga oshirilgan!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-orange-50 border-b">
                    <tr>
                      <th className="table-th">O'quvchi</th>
                      <th className="table-th">Guruh</th>
                      <th className="table-th">To'langan</th>
                      <th className="table-th">Oylik to'lov</th>
                      <th className="table-th text-red-600">Qarzdorlik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {debtors.map((d, i) => (
                      <tr key={i} className="hover:bg-orange-50">
                        <td className="table-td font-medium">{d.student_name}</td>
                        <td className="table-td text-gray-500">{groupMap[d.group_id] || `#${d.group_id}`}</td>
                        <td className="table-td text-green-600">{formatMoney(d.total_paid)}</td>
                        <td className="table-td text-gray-500">{formatMoney(d.monthly_fee)}</td>
                        <td className="table-td font-bold text-red-600">{formatMoney(d.debt)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td colSpan={4} className="table-td font-semibold text-right">Jami qarzdorlik:</td>
                      <td className="table-td font-bold text-red-600">{formatMoney(debtors.reduce((s, d) => s + d.debt, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="To'lov kiritish" size="lg">
        <PaymentForm
          students={students} groups={groups}
          onSubmit={data => createMut.mutate(data)}
          loading={createMut.isPending}
          error={createMut.error?.response?.data?.detail}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)} loading={deleteMut.isPending}
        title="To'lovni o'chirish" message="Bu to'lovni o'chirishni tasdiqlaysizmi?"
      />
    </div>
  )
}
