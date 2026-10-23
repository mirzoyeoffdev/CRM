import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Users, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getGroups, createGroup, updateGroup, deleteGroup } from '../../api/groups'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import { Spinner, ErrorMessage, EmptyState, PageHeader, ConfirmDialog } from '../../components/ui'
import { levelLabels, levelColors, formatMoney } from '../../utils/constants'

const LEVELS = ['beginner', 'elementary', 'pre-intermediate', 'intermediate', 'upper-intermediate', 'advanced']

function GroupForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || { max_students: 15, monthly_fee: 0 }
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Guruh nomi *</label>
          <input className="input" placeholder="A1-Ertalab" {...register('name', { required: 'Nom kiritilishi shart' })} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Daraja *</label>
          <select className="input" {...register('level', { required: true })}>
            {LEVELS.map(l => <option key={l} value={l}>{levelLabels[l]}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">O'qituvchi *</label>
        <input className="input" {...register('teacher_name', { required: "O'qituvchi kiritilishi shart" })} />
        {errors.teacher_name && <p className="text-red-500 text-xs mt-1">{errors.teacher_name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Max o'quvchilar soni</label>
          <input className="input" type="number" {...register('max_students', { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Oylik to'lov (so'm)</label>
          <input className="input" type="number" {...register('monthly_fee', { valueAsNumber: true })} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  )
}

export default function Groups() {
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [editGroup, setEditGroup] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: groups = [], isLoading, error } = useQuery({ queryKey: ['groups'], queryFn: getGroups })

  const createMut = useMutation({
    mutationFn: createGroup,
    onSuccess: () => { qc.invalidateQueries(['groups']); setAddOpen(false) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateGroup(id, data),
    onSuccess: () => { qc.invalidateQueries(['groups']); setEditGroup(null) },
  })
  const deleteMut = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => { qc.invalidateQueries(['groups']); setDeleteId(null) },
  })

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={error.message} />

  return (
    <div className="p-6">
      <PageHeader
        title="Guruhlar"
        subtitle={`Jami ${groups.length} ta guruh`}
        action={
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Yangi guruh
          </button>
        }
      />

      {groups.length === 0 ? (
        <EmptyState text="Hali guruh yaratilmagan" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map(g => (
            <div key={g.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{g.name}</h3>
                  <Badge label={levelLabels[g.level] || g.level} colorClass={levelColors[g.level] || 'bg-gray-100 text-gray-700'} />
                </div>
                <div className="flex gap-2">
                  <Link to={`/groups/${g.id}`} className="text-blue-500 hover:text-blue-700">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteId(g.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">👨‍🏫 {g.teacher_name}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Users className="w-4 h-4" /> Max: {g.max_students}
                </span>
                <span className="font-medium text-green-700">{formatMoney(g.monthly_fee)}/oy</span>
              </div>
              <button
                className="btn-secondary w-full text-xs"
                onClick={() => setEditGroup(g)}
              >
                Tahrirlash
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Yangi guruh yaratish">
        <GroupForm onSubmit={data => createMut.mutate(data)} loading={createMut.isPending} />
        {createMut.isError && <p className="text-red-500 text-sm mt-2">{createMut.error?.response?.data?.detail}</p>}
      </Modal>

      <Modal isOpen={!!editGroup} onClose={() => setEditGroup(null)} title="Guruhni tahrirlash">
        {editGroup && (
          <GroupForm
            defaultValues={editGroup}
            onSubmit={data => updateMut.mutate({ id: editGroup.id, data })}
            loading={updateMut.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        loading={deleteMut.isPending}
        title="Guruhni o'chirish"
        message="Bu guruhni o'chirishni tasdiqlaysizmi?"
      />
    </div>
  )
}
