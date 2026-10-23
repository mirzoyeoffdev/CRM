import { Loader2 } from 'lucide-react'

export function Spinner({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

export function ErrorMessage({ message }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <p className="text-red-500 font-medium">Xatolik yuz berdi</p>
        <p className="text-gray-500 text-sm mt-1">{message}</p>
      </div>
    </div>
  )
}

export function EmptyState({ text = "Ma'lumot topilmadi" }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
      {text}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm mt-2">{message}</p>
        <div className="flex gap-3 mt-6 justify-end">
          <button className="btn-secondary" onClick={onClose}>Bekor qilish</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "O'chirilmoqda..." : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  )
}
