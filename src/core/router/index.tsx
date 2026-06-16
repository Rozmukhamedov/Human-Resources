import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from './ProtectedRoute'

const LoginPage            = lazy(() => import('@modules/auth').then(m => ({ default: m.LoginPage })))
const DashboardPage        = lazy(() => import('@modules/dashboard').then(m => ({ default: m.DashboardPage })))
const EmployeeListPage     = lazy(() => import('@modules/employees').then(m => ({ default: m.EmployeeListPage })))
const EmployeeProfilePage  = lazy(() => import('@modules/employees').then(m => ({ default: m.EmployeeProfilePage })))
const ProfileTab           = lazy(() => import('@modules/employees').then(m => ({ default: m.ProfileTab })))
const LeaveTab             = lazy(() => import('@modules/employees').then(m => ({ default: m.LeaveTab })))
const ActivitiesTab        = lazy(() => import('@modules/employees').then(m => ({ default: m.ActivitiesTab })))
const AssessmentsTab       = lazy(() => import('@modules/employees').then(m => ({ default: m.AssessmentsTab })))
const IncidentsTab         = lazy(() => import('@modules/employees').then(m => ({ default: m.IncidentsTab })))
const LeaveRequestsPage    = lazy(() => import('@modules/leave').then(m => ({ default: m.LeaveRequestsPage })))
const AssessmentsPage      = lazy(() => import('@modules/assessments').then(m => ({ default: m.AssessmentsPage })))
const AssessmentDetailPage = lazy(() => import('@modules/assessments').then(m => ({ default: m.AssessmentDetailPage })))
const ShiftSchedulesPage   = lazy(() => import('@modules/shifts').then(m => ({ default: m.ShiftSchedulesPage })))
const OrgChartPage         = lazy(() => import('@modules/org-chart').then(m => ({ default: m.OrgChartPage })))
const AttendanceReportPage = lazy(() => import('@modules/attendance').then(m => ({ default: m.AttendanceReportPage })))
const ProfilePage          = lazy(() => import('@modules/profile').then(m => ({ default: m.ProfilePage })))

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true,        element: <DashboardPage /> },
          { path: 'employees',  element: <EmployeeListPage /> },
          {
            path: 'employees/:id',
            element: <EmployeeProfilePage />,
            children: [
              { index: true,           element: <Navigate to="profile" replace /> },
              { path: 'profile',       element: <ProfileTab /> },
              { path: 'leave',         element: <LeaveTab /> },
              { path: 'activities',    element: <ActivitiesTab /> },
              { path: 'assessments',   element: <AssessmentsTab /> },
              { path: 'incidents',     element: <IncidentsTab /> },
            ],
          },
          { path: 'leave',              element: <LeaveRequestsPage /> },
          { path: 'assessments',        element: <AssessmentsPage /> },
          { path: 'assessments/:id',    element: <AssessmentDetailPage /> },
          { path: 'shifts',             element: <ShiftSchedulesPage /> },
          { path: 'org/supervisor',     element: <OrgChartPage mode="supervisor" /> },
          { path: 'org/structure',      element: <OrgChartPage mode="org" /> },
          { path: 'attendance',         element: <AttendanceReportPage /> },
          { path: 'profile',            element: <ProfilePage /> },
        ],
      },
    ],
  },
])
