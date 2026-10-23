import api from './client'

export const getEnrollments = () => api.get('/enrollments/').then(r => r.data)
export const createEnrollment = (data) => api.post('/enrollments/', data).then(r => r.data)
export const updateEnrollment = (id, data) => api.patch(`/enrollments/${id}`, data).then(r => r.data)
export const deleteEnrollment = (id) => api.delete(`/enrollments/${id}`)
