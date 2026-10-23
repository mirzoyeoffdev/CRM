import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../api/students'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import { Spinner, ErrorMessage, EmptyState, PageHeader, ConfirmDialog } from '../../components/ui'
import { formatDate } from '../../utils/constants'

function StudentForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Ism *</label>
          <input className="input" {...register('first_name', { required: "Ism kiritilishi shart" })} />
          {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <label className="label">Familiya *</label>
          <input className="input" {...register('last_name', { required: "Familiya kiritilishi shart" })} />
          {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
        </div>
      </div>
      <div>
        <label className="label">Telefon *</label>
        <input className="input" placeholder="+998901234567" {...register('phone', { required: "Telefon kiritilishi shart" })} />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" {...register('email')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Tug'ilgan sana</label>
          <input className="input" type="date" {...register('birth_date')} />
        </div>
        <div>
          <label className="label">Manzil</label>
          <input className="input" {...register('address')} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </form>
  )
}

export default function Students() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students', search],
    queryFn: () => getStudents(search ? { search } : {}),
  })

  const createMut = useMutation({
    mutationFn: createStudent,
    onSuccess: () => { qc.invalidateQueries(['students']); setAddOpen(false) },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () => { qc.invalidateQueries(['students']); setEditStudent(null) },
  })
  const deleteMut = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => { qc.invalidateQueries(['students']); setDeleteId(null) },
  })

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={error.message} />

  return (
    <div className="p-6">
      <PageHeader
        title="O'quvchilar"
        subtitle={`Jami ${students.length} ta`}
        action={
          <button className="btn-primary" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Yangi o'quvchi
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Ism yoki telefon..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="table-th">#</th>
              <th className="table-th">Ism Familiya</th>
              <th className="table-th">Telefon</th>
              <th className="table-th">Email</th>
              <th className="table-th">Holat</th>
              <th className="table-th">Qo'shilgan</th>
              <th className="table-th">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 ? (
              <tr><td colSpan={7}><EmptyState text="O'quvchilar topilmadi" /></td></tr>
            ) : students.map((s, i) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="table-td text-gray-400">{i + 1}</td>
                <td className="table-td font-medium">{s.first_name} {s.last_name}</td>
                <td className="table-td">{s.phone}</td>
                <td className="table-td text-gray-500">{s.email || '—'}</td>
                <td className="table-td">
                  <Badge label={s.is_active ? 'Faol' : 'Nofaol'} colorClass={s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} />
                </td>
                <td className="table-td text-gray-500">{formatDate(s.created_at)}</td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <Link to={`/students/${s.id}`} className="text-blue-500 hover:text-blue-700" title="Ko'rish">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button className="text-gray-400 hover:text-gray-700" onClick={() => setEditStudent(s)} title="Tahrirlash">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600" onClick={() => setDeleteId(s.id)} title="O'chirish">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Yangi o'quvchi qo'shish">
        <StudentForm
          onSubmit={data => createMut.mutate(data)}
          loading={createMut.isPending}
        />
        {createMut.isError && <p className="text-red-500 text-sm mt-2">{createMut.error?.response?.data?.detail}</p>}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="O'quvchini tahrirlash">
        {editStudent && (
          <StudentForm
            defaultValues={editStudent}
            onSubmit={data => updateMut.mutate({ id: editStudent.id, data })}
            loading={updateMut.isPending}
          />
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        loading={deleteMut.isPending}
        title="O'quvchini o'chirish"
        message="Bu o'quvchini o'chirishni tasdiqlaysizmi? Barcha ma'lumotlari ham o'chib ketadi."
      />
    </div>
  )
}
