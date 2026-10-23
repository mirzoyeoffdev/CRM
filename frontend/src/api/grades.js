import api from './client'

export const getStudentGrades = (studentId, params) =>
  api.get(`/grades/student/${studentId}`, { params }).then(r => r.data)
export const getGroupGradeSummary = (groupId) =>
  api.get(`/grades/group/${groupId}/summary`).then(r => r.data)
export const createGrade = (data) => api.post('/grades/', data).then(r => r.data)
export const deleteGrade = (id) => api.delete(`/grades/${id}`)
