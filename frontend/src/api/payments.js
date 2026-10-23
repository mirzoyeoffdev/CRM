import api from './client'

export const getPayments = (params) => api.get('/payments/', { params }).then(r => r.data)
export const getStudentPayments = (studentId, params) =>
  api.get(`/payments/student/${studentId}`, { params }).then(r => r.data)
export const getDebtors = (params) => api.get('/payments/debtors', { params }).then(r => r.data)
export const createPayment = (data) => api.post('/payments/', data).then(r => r.data)
export const deletePayment = (id) => api.delete(`/payments/${id}`)
