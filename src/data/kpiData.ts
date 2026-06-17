import { employees } from './employees'
import type { KpiEmployee, KpiScores } from '@modules/kpi/model/kpi.types'

const KPI_KEYS: (keyof KpiScores)[] = ['attendance', 'tasks', 'care', 'docs', 'discipline', 'assessment']

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h * 31 + str.charCodeAt(i)) >>> 0)
  }
  return h
}

function scoresFor(id: string): KpiScores {
  const h = hash(id)
  const scores: Partial<KpiScores> = {}
  KPI_KEYS.forEach((k, i) => {
    const v = 72 + ((h >> (i * 3)) % 28) + ((h >> (i + 11)) % 4)
    scores[k] = Math.min(100, v)
  })
  return scores as KpiScores
}

export const kpiEmployees: KpiEmployee[] = employees.map(e => ({
  id: e.id,
  initials: e.initials,
  firstName: e.firstName,
  lastName: e.lastName,
  departmentName: e.departmentName,
  scores: scoresFor(e.id),
  imported: false,
}))
