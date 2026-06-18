import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { kpiEmployees } from '@data/kpiData'
import type { KpiScores, KpiWeights } from '../model/kpi.types'

const KPI_KEYS: (keyof KpiScores)[] = ['attendance', 'tasks', 'care', 'docs', 'discipline', 'assessment']

const DEFAULT_WEIGHTS: KpiWeights = {
  attendance: 20,
  tasks: 25,
  care: 20,
  docs: 15,
  discipline: 10,
  assessment: 10,
}

function computeKpi(scores: KpiScores, weights: KpiWeights): number {
  const total = KPI_KEYS.reduce((a, k) => a + (weights[k] || 0), 0) || 1
  const sum = KPI_KEYS.reduce((a, k) => a + (scores[k] || 0) * (weights[k] || 0), 0)
  return Math.round((sum / total) * 10) / 10
}

const AV_PALETTE: [string, string][] = [
  ['#eef2ff', '#4f46e5'],
  ['#e7f7ee', '#0f9d58'],
  ['#fdf3e3', '#d97706'],
  ['#f3f1ff', '#7c3aed'],
  ['#eef4ff', '#2563eb'],
  ['#fdeaf3', '#db2777'],
]

function getAvColor(ini: string): [string, string] {
  return AV_PALETTE[(ini.charCodeAt(0) || 65) % AV_PALETTE.length]
}

type GradeKey = 'excellent' | 'good' | 'fair' | 'low'

function getGradeKey(kpi: number): GradeKey {
  if (kpi >= 95) return 'excellent'
  if (kpi >= 85) return 'good'
  if (kpi >= 75) return 'fair'
  return 'low'
}

const GRADE_STYLE: Record<GradeKey, { color: string; bg: string }> = {
  excellent: { color: '#0f9d58', bg: '#e7f7ee' },
  good:      { color: '#2563eb', bg: '#eef4ff' },
  fair:      { color: '#d97706', bg: '#fdf3e3' },
  low:       { color: '#dc2626', bg: '#fdeaea' },
}

function getCellColor(v: number): string {
  if (v >= 90) return '#0f9d58'
  if (v >= 80) return '#5b6270'
  return '#d97706'
}

const RANK_COLORS = ['#f5b301', '#9aa6b8', '#cd7f32']

interface ImportedEmp {
  id: string
  initials: string
  firstName: string
  lastName: string
  departmentName: string
  scores: KpiScores
  imported: true
}

type ImportStep = 'drop' | 'parsing' | 'preview'

function parseCsv(text: string): string[][] {
  return text
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')))
}

function colKey(header: string): string | null {
  const h = String(header || '').toLowerCase().trim()
  if (h.includes('famil') || h.includes('surname') || h.includes('last')) return 'surname'
  if (h === 'ism' || h === 'name' || h.includes('first')) return 'name'
  if (h.includes('lavoz') || h.includes('position')) return 'pos'
  if (h.includes("bo'lim") || h.includes('bolim') || h.includes('depart') || h === 'dept') return 'dept'
  if (h.includes('davomat') || h.includes('attend')) return 'attendance'
  if (h.includes('vazifa') || h.includes('task')) return 'tasks'
  if (h.includes('parvar') || h.includes('care')) return 'care'
  if (h.includes('hujjat') || h.includes('doc')) return 'docs'
  if (h.includes('intizom') || h.includes('discipl')) return 'discipline'
  if (h.includes('attest') || h.includes('assess')) return 'assessment'
  return null
}

function downloadCsvTemplate() {
  const rows = [
    ["Ism", "Familiya", "Bo'lim", "Lavozim", "Davomat", "Vazifalar", "Parvarish", "Hujjatlar", "Intizom", "Attestatsiya"],
    ["Moxira", "Karimova", "Nevrologiya bo'limi", "Katta hamshira", "98", "95", "97", "96", "100", "100"],
    ["Aziz", "Rahimov", "Jarroxlik reanimatsiya", "Shifokor", "92", "90", "88", "94", "96", "91"],
  ]
  const csv = rows.map(r => r.map(c => c.includes(',') ? `"${c}"` : c).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'kpi_import_template.csv'; a.click()
  URL.revokeObjectURL(url)
}

export function KpiPage() {
  const { t } = useTranslation('common')
  const [weights, setWeights] = useState<KpiWeights>({ ...DEFAULT_WEIGHTS })
  const [imported, setImported] = useState<ImportedEmp[]>([])
  const [importOpen, setImportOpen] = useState(false)
  const [importStep, setImportStep] = useState<ImportStep>('drop')
  const [importRows, setImportRows] = useState<ImportedEmp[]>([])
  const [importFileName, setImportFileName] = useState('')
  const [importError, setImportError] = useState('')
  const [importMapped, setImportMapped] = useState(0)
  const [toast, setToast] = useState('')

  const totalW = KPI_KEYS.reduce((a, k) => a + (weights[k] || 0), 0)

  const allEmps = [...kpiEmployees, ...imported]
  const kpiList = allEmps
    .map(e => {
      const kpi = computeKpi(e.scores, weights)
      return { ...e, kpi, gradeKey: getGradeKey(kpi) }
    })
    .sort((a, b) => b.kpi - a.kpi)

  const avgKpi = kpiList.length
    ? Math.round((kpiList.reduce((s, e) => s + e.kpi, 0) / kpiList.length) * 10) / 10
    : 0
  const belowCount = kpiList.filter(e => e.kpi < 75).length
  const topPerformer = kpiList[0]

  const handleFile = (file: File) => {
    setImportFileName(file.name)
    setImportStep('parsing')
    setImportError('')
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const rows = parseCsv((ev.target?.result as string) || '')
        if (!rows.length) throw new Error('empty')
        const header = rows[0]
        const posMap = ['name', 'surname', 'dept', 'pos', 'attendance', 'tasks', 'care', 'docs', 'discipline', 'assessment']
        const colMap = header.map((h, i) => colKey(h) || posMap[i] || null)
        const mappedCount = colMap.filter(Boolean).length
        const data: ImportedEmp[] = rows
          .slice(1)
          .filter(r => r?.[0])
          .map((r, ri) => {
            const scores: KpiScores = { attendance: 0, tasks: 0, care: 0, docs: 0, discipline: 0, assessment: 0 }
            let firstName = '', lastName = '', departmentName = ''
            colMap.forEach((key, ci) => {
              if (!key) return
              if (key === 'name') firstName = r[ci] ?? ''
              else if (key === 'surname') lastName = r[ci] ?? ''
              else if (key === 'dept') departmentName = r[ci] ?? ''
              else if (key in scores) {
                const n = Number(r[ci])
                ;(scores as unknown as Record<string, number>)[key] = isNaN(n) ? 0 : Math.max(0, Math.min(100, n))
              }
            })
            return {
              id: `IMP${ri + 1}`,
              initials: ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'IM',
              firstName, lastName, departmentName, scores, imported: true as const,
            }
          })
        if (!data.length) throw new Error('norows')
        setImportRows(data)
        setImportMapped(mappedCount)
        setImportStep('preview')
      } catch {
        setImportError(t('kpi.importErr'))
        setImportStep('drop')
      }
    }
    reader.onerror = () => { setImportError(t('kpi.importErr')); setImportStep('drop') }
    reader.readAsText(file)
  }

  const confirmImport = () => {
    const n = importRows.length
    setImported(prev => [...prev, ...importRows])
    setImportOpen(false)
    setToast(`${n} ${t('kpi.done')}`)
    setTimeout(() => setToast(''), 3200)
  }

  const openImport = () => {
    setImportOpen(true)
    setImportStep('drop')
    setImportRows([])
    setImportFileName('')
    setImportError('')
  }

  return (
    <div style={{ padding: '22px 24px 44px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 22, color: 'var(--text-heading)', letterSpacing: '-.01em' }}>
            {t('kpi.title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t('kpi.subtitle')}</div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={downloadCsvTemplate}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 11, fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', background: 'var(--surface)' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {t('kpi.downloadTemplate')}
        </button>
        <button
          onClick={openImport}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'var(--accent)', borderRadius: 11, fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'pointer', border: 'none', boxShadow: '0 4px 14px var(--accent-ring)' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
          {t('kpi.importExcel')}
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('kpi.avgKpi')}</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 28, color: 'var(--accent)', marginTop: 6 }}>{avgKpi}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('kpi.evaluated')}</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 28, color: 'var(--text-heading)', marginTop: 6 }}>{kpiList.length}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('kpi.top')}</div>
          {topPerformer ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {topPerformer.firstName} {topPerformer.lastName}
              </div>
              <div style={{ fontSize: 12, color: '#0f9d58', fontWeight: 700 }}>{topPerformer.kpi.toFixed(1)} KPI</div>
            </>
          ) : <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>—</div>}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{t('kpi.below')}</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 28, color: belowCount > 0 ? '#dc2626' : '#0f9d58', marginTop: 6 }}>
            {belowCount}
          </div>
        </div>
      </div>

      {/* Main content: weights panel + ranking table */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

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
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-heading)', flex: 1 }}>{t('kpi.weights')}</div>
            <button
              onClick={() => setWeights({ ...DEFAULT_WEIGHTS })}
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              {t('kpi.reset')}
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.4 }}>{t('kpi.weightsSub')}</div>

          {KPI_KEYS.map(k => (
            <div key={k} style={{ marginBottom: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{t(`kpi.ind.${k}`)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{weights[k]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weights[k]}
                onChange={e => setWeights(prev => ({ ...prev, [k]: Number(e.target.value) }))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{t('kpi.totalW')}</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: totalW === 100 ? '#0f9d58' : '#d97706' }}>{totalW}%</span>
          </div>
        </div>

        {/* Ranking table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 900 }}>
              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '56px 1.7fr 1.5fr repeat(6,minmax(0,1fr)) 160px 1fr',
                alignItems: 'center', padding: '0 16px', height: 46,
                background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)',
                fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: '.03em', textTransform: 'uppercase',
              }}>
                <div>{t('kpi.rank')}</div>
                <div>{t('kpi.employee')}</div>
                <div>{t('kpi.dept')}</div>
                {KPI_KEYS.map(k => (
                  <div key={k} style={{ textAlign: 'center' }}>{t(`kpi.ind.${k}`)}</div>
                ))}
                <div>{t('kpi.kpiScore')}</div>
                <div>{t('kpi.grade')}</div>
              </div>

              {/* Data rows */}
              <div style={{ maxHeight: 560, overflowY: 'auto' }}>
                {kpiList.map((e, i) => {
                  const [avBg, avColor] = getAvColor(e.initials)
                  const gs = GRADE_STYLE[e.gradeKey]
                  return (
                    <div
                      key={e.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '56px 1.7fr 1.5fr repeat(6,minmax(0,1fr)) 160px 1fr',
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
                          color: i < 3 ? '#fff' : '#9aa1ad',
                          background: i < 3 ? RANK_COLORS[i] : '#f1f3f6',
                        }}>
                          {i + 1}
                        </span>
                      </div>

                      {/* Employee */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                          {e.initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {e.firstName} {e.lastName}
                          </div>
                          {e.imported && (
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', borderRadius: 5, padding: '0 5px', display: 'inline-block' }}>
                              {t('kpi.imported')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dept */}
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                        {e.departmentName}
                      </div>

                      {/* Indicator scores */}
                      {KPI_KEYS.map(k => (
                        <div key={k} style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: getCellColor(e.scores[k]) }}>
                          {e.scores[k]}
                        </div>
                      ))}

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
                          {t(`kpi.${e.gradeKey}`)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Excel Import Modal */}
      {importOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,19,28,.5)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 18, width: '100%', maxWidth: 640, boxShadow: '0 24px 70px rgba(10,15,30,.35)', overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-heading)', flex: 1 }}>{t('kpi.importTitle')}</div>
              <button onClick={() => setImportOpen(false)} style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 20 }}>×</button>
            </div>

            {/* Drop step */}
            {importStep === 'drop' && (
              <div style={{ padding: 24 }}>
                <label
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
                  onDragOver={e => e.preventDefault()}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: '2px dashed #d4d8e0', borderRadius: 14, padding: '46px 24px', cursor: 'pointer', textAlign: 'center', background: 'var(--bg-subtle)' }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>{t('kpi.drop')}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('kpi.dropSub')}</div>
                  <div style={{ marginTop: 6, padding: '9px 20px', background: 'var(--accent)', color: '#fff', borderRadius: 10, fontSize: 13.5, fontWeight: 600 }}>{t('kpi.browse')}</div>
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} style={{ display: 'none' }} />
                </label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('kpi.supported')}</div>
                  <button onClick={downloadCsvTemplate} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>{t('kpi.needTemplate')}</button>
                </div>
                {importError && (
                  <div style={{ marginTop: 14, background: '#fdeaea', border: '1px solid #f6cccc', color: '#c0392b', borderRadius: 10, padding: '11px 14px', fontSize: 13 }}>
                    {importError}
                  </div>
                )}
              </div>
            )}

            {/* Parsing step */}
            {importStep === 'parsing' && (
              <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 42, height: 42, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'kpi-spin .8s linear infinite' }} />
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>{t('kpi.parsing')}</div>
              </div>
            )}

            {/* Preview step */}
            {importStep === 'preview' && (
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#e7f7ee', color: '#0f9d58', borderRadius: 9, padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {importFileName}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <b>{importRows.length}</b> {t('kpi.rowsFound')} · <b>{importMapped}</b> {t('kpi.colsMapped')}
                  </div>
                </div>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 1.6fr repeat(6,1fr)', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', padding: '9px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    <div>{t('kpi.employee')}</div>
                    <div></div>
                    <div>{t('kpi.dept')}</div>
                    {KPI_KEYS.map(k => (
                      <div key={k} style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(`kpi.ind.${k}`)}</div>
                    ))}
                  </div>
                  <div style={{ maxHeight: 230, overflowY: 'auto' }}>
                    {importRows.slice(0, 6).map((r, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1.3fr 1.6fr repeat(6,1fr)', padding: '9px 12px', borderBottom: '1px solid var(--border-color)', fontSize: 12, alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>{r.firstName}</div>
                        <div style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>{r.lastName}</div>
                        <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 6 }}>{r.departmentName}</div>
                        {KPI_KEYS.map(k => (
                          <div key={k} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>{r.scores[k]}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
                  <button
                    onClick={() => setImportOpen(false)}
                    style={{ padding: '10px 20px', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', background: 'var(--surface)' }}
                  >
                    {t('kpi.cancel')}
                  </button>
                  <button
                    onClick={confirmImport}
                    style={{ padding: '10px 22px', background: 'var(--accent)', borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'pointer', border: 'none', boxShadow: '0 3px 10px var(--accent-ring)' }}
                  >
                    {t('kpi.confirm')} ({importRows.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
