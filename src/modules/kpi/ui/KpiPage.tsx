import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { KpiResultEmployee, KpiResultsResponse, KpiGrade } from '../model/kpi.types'
import { calculateKpi, getKpiResults, getKpiWeights, updateKpiWeights, exportKpiExcel } from '../api/kpi'
import type { AssessmentTemplate } from '@modules/assessments/model/assessmentTemplate.types'
import { updateAssessmentTemplate } from '@modules/assessments/api/assessmentTemplates'

const DEFAULT_KEYS: ('attendance' | 'discipline')[] = ['attendance', 'discipline']

const AV_PALETTE: [string, string][] = [
  ['#eef2ff', '#4f46e5'],
  ['#e7f7ee', '#0f9d58'],
  ['#fdf3e3', '#d97706'],
  ['#f3f1ff', '#7c3aed'],
  ['#eef4ff', '#2563eb'],
  ['#fdeaf3', '#db2777'],
]

function getAvColor(name: string): [string, string] {
  return AV_PALETTE[(name.charCodeAt(0) || 65) % AV_PALETTE.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name.slice(0, 2)).toUpperCase()
}

const GRADE_STYLE: Record<KpiGrade, { color: string; bg: string }> = {
  excellent: { color: '#0f9d58', bg: '#e7f7ee' },
  good:      { color: '#2563eb', bg: '#eef4ff' },
  fair:      { color: '#d97706', bg: '#fdf3e3' },
  low:       { color: '#dc2626', bg: '#fdeaea' },
}

function getCellColor(v: number | null): string {
  if (v == null) return 'var(--text-muted, #9aa1ad)'
  if (v >= 90) return '#0f9d58'
  if (v >= 80) return '#5b6270'
  return '#d97706'
}

const RANK_COLORS = ['#f5b301', '#9aa6b8', '#cd7f32']

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
      <div style={{ width: 14, height: 14, border: '2px solid var(--border-color)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'kpi-spin .8s linear infinite' }} />
    </div>
  )
}

export function KpiPage() {
  const { t } = useTranslation('common')

  const [indicators, setIndicators] = useState<AssessmentTemplate[]>([])
  const [weightsLoading, setWeightsLoading] = useState(true)
  const [weightsSaving, setWeightsSaving] = useState(false)
  const [savedIndicators, setSavedIndicators] = useState<AssessmentTemplate[]>([])
  const [attendanceWeight, setAttendanceWeight] = useState(0)
  const [disciplineWeight, setDisciplineWeight] = useState(0)
  const [savedAttendanceWeight, setSavedAttendanceWeight] = useState(0)
  const [savedDisciplineWeight, setSavedDisciplineWeight] = useState(0)

  const [results, setResults] = useState<KpiResultsResponse | null>(null)
  const [resultsLoading, setResultsLoading] = useState(true)
  const [resultsError, setResultsError] = useState<string | null>(null)

  const [toast, setToast] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setWeightsLoading(true)
    getKpiWeights()
      .then(data => {
        const sorted = [...data.custom_indicators].sort((a, b) => a.order - b.order)
        setIndicators(sorted)
        setSavedIndicators(sorted)
        setAttendanceWeight(data.attendance)
        setSavedAttendanceWeight(data.attendance)
        setDisciplineWeight(data.discipline)
        setSavedDisciplineWeight(data.discipline)
      })
      .catch(() => {})
      .finally(() => setWeightsLoading(false))
  }, [])

  const loadResults = () => {
    setResultsLoading(true)
    setResultsError(null)
    getKpiResults()
      .then(data => setResults(data))
      .catch(e => setResultsError((e as Error).message || t('error')))
      .finally(() => setResultsLoading(false))
  }

  useEffect(() => {
    loadResults()
  }, [])

  const handleWeightChange = (id: number, val: number) => {
    setIndicators(prev => prev.map(ind => ind.id === id ? { ...ind, weight: val } : ind))
  }

  const handleDefaultWeightChange = (key: 'attendance' | 'discipline', val: number) => {
    if (key === 'attendance') setAttendanceWeight(val)
    else setDisciplineWeight(val)
  }

  const weightsDirty = attendanceWeight !== savedAttendanceWeight
    || disciplineWeight !== savedDisciplineWeight
    || indicators.some(ind => ind.weight !== savedIndicators.find(s => s.id === ind.id)?.weight)

  const handleResetWeights = () => {
    setIndicators(savedIndicators.map(ind => ({ ...ind })))
    setAttendanceWeight(savedAttendanceWeight)
    setDisciplineWeight(savedDisciplineWeight)
  }

  const handleSaveWeights = async () => {
    setWeightsSaving(true)
    try {
      const changed = indicators.filter(ind => {
        const saved = savedIndicators.find(s => s.id === ind.id)
        return saved && saved.weight !== ind.weight
      })
      const tasks: Promise<unknown>[] = changed.map(ind =>
        updateAssessmentTemplate(ind.id, { name: ind.name, weight: ind.weight, order: ind.order })
      )
      if (attendanceWeight !== savedAttendanceWeight || disciplineWeight !== savedDisciplineWeight) {
        tasks.push(updateKpiWeights({ attendance: attendanceWeight, discipline: disciplineWeight }))
      }
      await Promise.all(tasks)
      setSavedIndicators(indicators.map(ind => ({ ...ind })))
      setSavedAttendanceWeight(attendanceWeight)
      setSavedDisciplineWeight(disciplineWeight)
      await calculateKpi()
      setToast(t('kpi.weightsSaved'))
      setTimeout(() => setToast(''), 3000)
      loadResults()
    } catch (e) {
      alert((e as Error).message || t('error'))
    } finally {
      setWeightsSaving(false)
    }
  }

  const totalW = attendanceWeight + disciplineWeight + indicators.reduce((s, ind) => s + (ind.weight || 0), 0)

  const rankList: KpiResultEmployee[] = results?.results ?? []
  const avgKpi = results?.avg_kpi ?? 0
  const evalCount = results?.count ?? 0
  const belowCount = results?.below_75_count ?? 0
  const topPerformer = rankList[0] ?? null

  const indicatorColumnCount = DEFAULT_KEYS.length + indicators.length
  const tableColumns = `56px 1.7fr 1.5fr repeat(${indicatorColumnCount},minmax(0,1fr)) 160px 1fr`
  const tableMinWidth = 460 + indicatorColumnCount * 90

  return (
    <div style={{ padding: '22px 24px 44px' }}>
      <style>{`@keyframes kpi-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 22, color: 'var(--text-heading)', letterSpacing: '-.01em' }}>
            {t('kpi.title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {results
              ? t('kpi.monthSub', { year: results.year, month: results.month })
              : t('kpi.subtitle')}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={async () => {
            setExporting(true)
            try {
              await exportKpiExcel()
            } catch (e) {
              alert((e as Error).message || t('error'))
            } finally {
              setExporting(false)
            }
          }}
          disabled={exporting}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 18px', border: 'none', borderRadius: 10,
            background: 'var(--accent)', color: '#fff',
            cursor: exporting ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {exporting ? '...' : t('kpi.exportExcel')}
        </button>
        {resultsLoading && <Spinner />}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('kpi.avgKpi')}</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 28, color: 'var(--accent)', marginTop: 6 }}>
            {avgKpi.toFixed(1)}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('kpi.evaluated')}</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 28, color: 'var(--text-heading)', marginTop: 6 }}>
            {evalCount}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('kpi.top')}</div>
          {topPerformer ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {topPerformer.employee_name}
              </div>
              <div style={{ fontSize: 12, color: '#0f9d58', fontWeight: 700 }}>{topPerformer.kpi.toFixed(1)} KPI</div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>—</div>
          )}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('kpi.below')}</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 28, color: belowCount > 0 ? '#dc2626' : '#0f9d58', marginTop: 6 }}>
            {belowCount}
          </div>
        </div>
      </div>

      {/* Main content: weights panel + ranking table */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start', minWidth: 0 }}>

        {/* Weights panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
              <line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-heading)', flex: 1 }}>
              {t('kpi.weights')}
            </div>
            {weightsLoading && <Spinner />}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>
            {t('kpi.weightsSub')}
          </div>

          {DEFAULT_KEYS.map(k => {
            const weight = k === 'attendance' ? attendanceWeight : disciplineWeight
            return (
              <div key={k} style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{t(`kpi.ind.${k}`)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{weight}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weight}
                  onChange={e => handleDefaultWeightChange(k, Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
              </div>
            )
          })}

          {indicators.map(ind => (
            <div key={ind.id} style={{ marginBottom: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{ind.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{ind.weight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={ind.weight}
                onChange={e => handleWeightChange(ind.id, Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{t('kpi.totalW')}</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: totalW === 100 ? '#0f9d58' : '#d97706' }}>{totalW}%</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              onClick={handleResetWeights}
              disabled={!weightsDirty || weightsSaving}
              style={{
                flex: 1, padding: '9px 0',
                border: '1.5px solid var(--border-color, #e4e7ef)',
                borderRadius: 10, background: 'transparent',
                cursor: !weightsDirty || weightsSaving ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
                fontFamily: 'inherit',
                opacity: !weightsDirty ? 0.5 : 1,
              }}
            >
              {t('kpi.reset')}
            </button>
            <button
              onClick={() => void handleSaveWeights()}
              disabled={!weightsDirty || weightsSaving}
              style={{
                flex: 2, padding: '9px 0', border: 'none',
                borderRadius: 10,
                background: !weightsDirty ? '#a5b4fc' : weightsSaving ? '#a5b4fc' : 'var(--accent)',
                cursor: !weightsDirty || weightsSaving ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 700, color: '#fff',
                fontFamily: 'inherit',
                boxShadow: weightsDirty ? '0 2px 8px rgba(79,70,229,.2)' : 'none',
                opacity: !weightsDirty ? 0.5 : 1,
              }}
            >
              {weightsSaving ? '...' : t('kpi.saveWeights')}
            </button>
          </div>
        </div>

        {/* Ranking table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', minWidth: 0 }}>
          {resultsError ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#ef4444', fontSize: 13.5 }}>
              <div style={{ marginBottom: 12 }}>{resultsError}</div>
              <button
                onClick={loadResults}
                style={{ padding: '8px 20px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                {t('div.retry')}
              </button>
            </div>
          ) : rankList.length === 0 && !resultsLoading ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
              {t('div.notFound')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: tableMinWidth }}>
                {/* Header row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: tableColumns,
                  alignItems: 'center', padding: '0 16px', height: 46,
                  background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)',
                  fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '.03em', textTransform: 'uppercase',
                }}>
                  <div>{t('kpi.rank')}</div>
                  <div>{t('kpi.employee')}</div>
                  <div>{t('kpi.dept')}</div>
                  {DEFAULT_KEYS.map(k => (
                    <div key={k} style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>{t(`kpi.ind.${k}`)}</div>
                  ))}
                  {indicators.map(ind => (
                    <div key={ind.id} style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>{ind.name}</div>
                  ))}
                  <div>{t('kpi.kpiScore')}</div>
                  <div>{t('kpi.grade')}</div>
                </div>

                {/* Data rows */}
                <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                  {rankList.map((e) => {
                    const initials = getInitials(e.employee_name)
                    const [avBg, avColor] = getAvColor(e.employee_name)
                    const gs = GRADE_STYLE[e.grade] ?? GRADE_STYLE.low
                    return (
                      <div
                        key={e.employee_id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: tableColumns,
                          alignItems: 'center', padding: '0 16px', height: 56,
                          borderBottom: '1px solid var(--border-color)',
                        }}
                        onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--bg-subtle)')}
                        onMouseLeave={ev => (ev.currentTarget.style.background = '')}
                      >
                        {/* Rank */}
                        <div>
                          <span style={{
                            width: 26, height: 26, borderRadius: 8,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800,
                            color: e.rank <= 3 ? '#fff' : '#9aa1ad',
                            background: e.rank <= 3 ? RANK_COLORS[e.rank - 1] : '#f1f3f6',
                          }}>
                            {e.rank}
                          </span>
                        </div>

                        {/* Employee */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {e.employee_name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                              {e.employee_code}
                            </div>
                          </div>
                        </div>

                        {/* Dept */}
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                          {e.department_name}
                        </div>

                        {/* Indicator scores */}
                        {DEFAULT_KEYS.map(k => (
                          <div key={k} style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: getCellColor(e[k]) }}>
                            {e[k] != null ? e[k] : '—'}
                          </div>
                        ))}
                        {indicators.map(ind => {
                          const v = e.custom_scores[ind.name] ?? null
                          return (
                            <div key={ind.id} style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: getCellColor(v) }}>
                              {v != null ? v : '—'}
                            </div>
                          )
                        })}

                        {/* KPI score + progress bar */}
                        <div style={{ paddingRight: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 14, fontWeight: 800, color: 'var(--text-heading)', width: 38, flexShrink: 0 }}>
                              {e.kpi.toFixed(1)}
                            </span>
                            <div style={{ flex: 1, height: 8, background: '#f1f3f6', borderRadius: 5, overflow: 'hidden' }}>
                              <div style={{ height: 8, borderRadius: 5, width: `${e.kpi}%`, background: gs.color, transition: 'width .25s' }} />
                            </div>
                          </div>
                        </div>

                        {/* Grade badge */}
                        <div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11.5, fontWeight: 700, color: gs.color, background: gs.bg, borderRadius: 8, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                            {t(`kpi.${e.grade}`)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#10131c', color: '#fff', padding: '13px 22px', borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: '0 10px 30px rgba(10,15,30,.35)', zIndex: 120, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#0f9d58', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          {toast}
        </div>
      )}
    </div>
  )
}
