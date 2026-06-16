import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import uzCommon from './locales/uz/common.json'
import uzDashboard from './locales/uz/dashboard.json'
import uzEmployees from './locales/uz/employees.json'
import uzLeave from './locales/uz/leave.json'
import uzAssessments from './locales/uz/assessments.json'
import uzShifts from './locales/uz/shifts.json'
import uzOrgChart from './locales/uz/orgChart.json'
import uzAttendance from './locales/uz/attendance.json'

import enCommon from './locales/en/common.json'
import enDashboard from './locales/en/dashboard.json'
import enEmployees from './locales/en/employees.json'
import enLeave from './locales/en/leave.json'
import enAssessments from './locales/en/assessments.json'
import enShifts from './locales/en/shifts.json'
import enOrgChart from './locales/en/orgChart.json'
import enAttendance from './locales/en/attendance.json'

import ruCommon from './locales/ru/common.json'
import ruDashboard from './locales/ru/dashboard.json'
import ruEmployees from './locales/ru/employees.json'
import ruLeave from './locales/ru/leave.json'
import ruAssessments from './locales/ru/assessments.json'
import ruShifts from './locales/ru/shifts.json'
import ruOrgChart from './locales/ru/orgChart.json'
import ruAttendance from './locales/ru/attendance.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: {
        common: uzCommon,
        dashboard: uzDashboard,
        employees: uzEmployees,
        leave: uzLeave,
        assessments: uzAssessments,
        shifts: uzShifts,
        orgChart: uzOrgChart,
        attendance: uzAttendance,
      },
      en: {
        common: enCommon,
        dashboard: enDashboard,
        employees: enEmployees,
        leave: enLeave,
        assessments: enAssessments,
        shifts: enShifts,
        orgChart: enOrgChart,
        attendance: enAttendance,
      },
      ru: {
        common: ruCommon,
        dashboard: ruDashboard,
        employees: ruEmployees,
        leave: ruLeave,
        assessments: ruAssessments,
        shifts: ruShifts,
        orgChart: ruOrgChart,
        attendance: ruAttendance,
      },
    },
    fallbackLng: 'uz',
    defaultNS: 'common',
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
    interpolation: { escapeValue: false },
  })

export default i18n
