import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students/index'
import StudentDetail from './pages/Students/StudentDetail'
import Groups from './pages/Groups/index'
import GroupDetail from './pages/Groups/GroupDetail'
import Attendance from './pages/Attendance'
import Payments from './pages/Payments'
import Grades from './pages/Grades'
import Schedules from './pages/Schedules'
import Reports from './pages/Reports'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30 sekund
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
