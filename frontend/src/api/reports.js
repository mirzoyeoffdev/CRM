import api from './client'

export const getOverview = () => api.get('/reports/overview').then(r => r.data)
export const getMonthlyRevenue = (year) =>
  api.get('/reports/monthly-revenue', { params: { year } }).then(r => r.data)
export const getGroupStats = () => api.get('/reports/group-stats').then(r => r.data)
export const getStudentFullReport = (id) =>
  api.get(`/reports/student/${id}/full-report`).then(r => r.data)
