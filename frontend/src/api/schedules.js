import api from './client'

export const getGroupSchedule = (groupId) =>
  api.get(`/schedules/group/${groupId}`).then(r => r.data)
export const createSchedule = (data) => api.post('/schedules/', data).then(r => r.data)
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`)
