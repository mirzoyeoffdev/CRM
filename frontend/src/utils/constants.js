// Turli holat va daraja ranglarini qaytaradi
export const levelLabels = {
  beginner: 'Boshlang\'ich',
  elementary: 'Elementary',
  'pre-intermediate': 'Pre-Intermediate',
  intermediate: 'Intermediate',
  'upper-intermediate': 'Upper-Intermediate',
  advanced: 'Advanced',
}

export const levelColors = {
  beginner: 'bg-green-100 text-green-800',
  elementary: 'bg-blue-100 text-blue-800',
  'pre-intermediate': 'bg-indigo-100 text-indigo-800',
  intermediate: 'bg-purple-100 text-purple-800',
  'upper-intermediate': 'bg-orange-100 text-orange-800',
  advanced: 'bg-red-100 text-red-800',
}

export const attendanceLabels = {
  present: 'Keldi',
  absent: 'Kelmadi',
  late: 'Kech qoldi',
  excused: 'Sababli',
}

export const attendanceColors = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  excused: 'bg-gray-100 text-gray-800',
}

export const paymentMethodLabels = {
  cash: 'Naqd',
  card: 'Karta',
  bank: 'Bank',
  other: 'Boshqa',
}

export const examTypeLabels = {
  homework: 'Uy vazifasi',
  quiz: 'Quiz',
  midterm: 'Oraliq imtihon',
  final: 'Yakuniy imtihon',
  speaking: 'Speaking',
  writing: 'Writing',
}

export const weekdayLabels = {
  1: 'Dushanba',
  2: 'Seshanba',
  3: 'Chorshanba',
  4: 'Payshanba',
  5: 'Juma',
  6: 'Shanba',
  7: 'Yakshanba',
}

export const monthNames = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

export function formatMoney(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m'
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('uz-UZ')
}

export function getAttendanceRateColor(rate) {
  if (rate >= 80) return 'text-green-600'
  if (rate >= 60) return 'text-yellow-600'
  return 'text-red-600'
}
