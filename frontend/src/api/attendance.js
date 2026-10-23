import api from './client'

export const getStudentAttendance = (studentId, params) =>
  api.get(`/attendance/student/${studentId}`, { params }).then(r => r.data)

export const getGroupAttendance = (groupId, params) =>
  api.get(`/attendance/group/${groupId}`, { params }).then(r => r.data)

export const getGroupAttendanceSummary = (groupId) =>
  api.get(`/attendance/group/${groupId}/summary`).then(r => r.data)

export const markAttendance = (data) => api.post('/attendance/', data).then(r => r.data)
export const updateAttendance = (id, data) => api.patch(`/attendance/${id}`, data).then(r => r.data)
