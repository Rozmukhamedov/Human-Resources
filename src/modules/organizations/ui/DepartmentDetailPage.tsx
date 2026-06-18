import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDepartmentDetail } from '../api/departments'
import type { DepartmentDetailFull, DepartmentStaffMember } from '../model/department.types'

const MONTH_NAMES = [
  '', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

const IND_LABELS: Record<string, string> = {
  attendance: 'Davomat',
  tasks: 'Vazifalar',
  care: 'G\'amxo\'rlik',
  docs: 'Hujjatlar',
  discipline: 'Intizom',
  assessment: 'Baholash',
}

const IND_ICONS: Record<string, React.ReactNode> = {
  attendance: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>
    </svg>
  ),
  tasks: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  care: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  docs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  discipline: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  assessment: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
}

const IND_COLORS: Record<string, [string, string]> = {
  attendance: ['#eef4ff', '#2563eb'],
  tasks:      ['#e7f7ee', '#0f9d58'],
  care:       ['#fdeaf3', '#db2777'],
  docs:       ['#fdf3e3', '#d97706'],
  discipline: ['#f3f1ff', '#7c3aed'],
  assessment: ['#eef2ff', '#4f46e5'],
}

const GRADE_STYLE: Record<string, { color: string; bg: string }> = {
  excellent: { color: '#0f9d58', bg: '#e7f7ee' },
  good:      { color: '#2563eb', bg: '#eef4ff' },
  fair:      { color: '#d97706', bg: '#fdf3e3' },
  low:       { color: '#dc2626', bg: '#fdeaea' },
}

const GRADE_LABELS: Record<string, string> = {
  excellent: "A'la",
  good:      'Yaxshi',
  fair:      'Qoniqarli',
  low:       'Past',
}

const RANK_COLORS = ['#f5b301', '#9aa6b8', '#cd7f32']

const AV_PALETTE: [string, string][] = [
  ['#eef2ff', '#4f46e5'],
  ['#e7f7ee', '#0f9d58'],
  ['#fdf3e3', '#d97706'],
  ['#f3f1ff', '#7c3aed'],
  ['#eef4ff', '#2563eb'],
  ['#fdeaf3', '#db2777'],
]

function getAvColor(name: unknown): [string, string] {
  if (typeof name !== 'string' || !name) return AV_PALETTE[0]
  return AV_PALETTE[(name.charCodeAt(0) || 65) % AV_PALETTE.length]
}

function getInitials(name: unknown) {
  if (typeof name !== 'string' || !name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13,
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-heading)', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | React.ReactNode; sub?: string; accent?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em' }}>{label}</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 28, color: accent ?? 'var(--text-heading)', marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function IndicatorCard({ indKey, avg, weight }: { indKey: string; avg: number | null; weight: number }) {
  const [bg, color] = IND_COLORS[indKey] ?? ['#f1f3f6', '#5b6270']
  const displayAvg = avg != null ? avg.toFixed(1) : null
  const barWidth = avg != null ? Math.min(100, avg) : 0

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {IND_ICONS[indKey]}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{IND_LABELS[indKey]}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 7, padding: '3px 8px' }}>{weight}%</span>
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Plus Jakarta Sans'", color: displayAvg ? color : 'var(--text-muted)', marginBottom: 8 }}>
        {displayAvg ?? '—'}
      </div>

      <div style={{ height: 6, background: 'var(--bg-subtle, #f1f3f6)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: 6, borderRadius: 4, width: `${barWidth}%`, background: color, transition: 'width .3s' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>O'rtacha ball</div>
    </div>
  )
}

function StaffRow({ member, rank }: { member: DepartmentStaffMember; rank: number }) {
  const initials = getInitials(member.full_name)
  const [avBg, avColor] = getAvColor(member.full_name)
  const gs = member.grade ? (GRADE_STYLE[member.grade] ?? GRADE_STYLE.low) : null

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr 1fr 100px 140px 100px',
        alignItems: 'center',
        padding: '0 16px',
        height: 56,
        borderBottom: '1px solid var(--border-color)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
      onMouseLeave={e => (e.currentTarget.style.background = '')}
    >
      <div>
        <span style={{
          width: 26, height: 26, borderRadius: 8, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800,
          color: rank <= 3 ? '#fff' : '#9aa1ad',
          background: rank <= 3 ? RANK_COLORS[rank - 1] : '#f1f3f6',
        }}>
          {rank}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: avBg, color: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {member.full_name}
        </span>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
        {member.position ?? '—'}
      </div>

      <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: member.attendance != null ? (member.attendance >= 90 ? '#0f9d58' : member.attendance >= 75 ? '#d97706' : '#dc2626') : 'var(--text-muted)' }}>
        {member.attendance != null ? `${member.attendance}%` : '—'}
      </div>

      <div style={{ paddingRight: 12 }}>
        {member.kpi != null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 14, fontWeight: 800, color: 'var(--text-heading)', width: 36, flexShrink: 0 }}>
              {member.kpi.toFixed(1)}
            </span>
            <div style={{ flex: 1, height: 7, background: '#f1f3f6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: 7, borderRadius: 4, width: `${member.kpi}%`, background: '#4f46e5', transition: 'width .25s' }} />
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      <div>
        {gs && member.grade ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11.5, fontWeight: 700, color: gs.color, background: gs.bg, borderRadius: 8, padding: '3px 10px', whiteSpace: 'nowrap' }}>
            {GRADE_LABELS[member.grade] ?? member.grade}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '80px 0' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--border-color)',
        borderTopColor: '#4f46e5',
        animation: 'dept-spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes dept-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function BuildingIcon({ size = 28, color = '#4f46e5' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 22V12h6v10"/>
      <path d="M9 7h1M14 7h1M9 12h1M14 12h1"/>
    </svg>
  )
}

const IND_KEYS = ['attendance', 'tasks', 'care', 'docs', 'discipline', 'assessment'] as const

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dept, setDept] = useState<DepartmentDetailFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getDepartmentDetail(Number(id))
      .then(data => setDept(data))
      .catch(() => setDept(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />

  if (!dept) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Bo'lim topilmadi</div>
        <button
          onClick={() => navigate('/departments')}
          style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: '#4f46e5', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          Ortga
        </button>
      </div>
    )
  }

  const divColor = dept.division?.color ?? '#4f46e5'
  const period = `${MONTH_NAMES[dept.month] ?? dept.month}, ${dept.year}`

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, fontFamily: "'Public Sans', sans-serif" }}>

      {/* Back button + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <button
          onClick={() => navigate('/departments')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 9,
            border: '1.5px solid var(--border-color)',
            background: 'transparent', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Ortga
        </button>
        <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 18, color: 'var(--text-heading)' }}>
          {dept.name_uz}
        </div>
        {dept.division && (
          <span style={{
            fontSize: 11.5, fontWeight: 700, padding: '3px 10px',
            borderRadius: 20, whiteSpace: 'nowrap',
            background: `${divColor}18`,
            color: divColor,
          }}>
            {dept.division.name_uz}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, maxWidth: 1200 }}>

        {/* ── Left sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Hero card */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: `${divColor}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BuildingIcon size={32} color={divColor} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 17, color: 'var(--text-heading)', lineHeight: 1.3 }}>
                {dept.name_uz}
              </div>
              {dept.name_en && dept.name_en !== dept.name_uz && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{dept.name_en}</div>
              )}
              {dept.division && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: divColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{dept.division.name_uz}</span>
                </div>
              )}
            </div>
          </div>

          {/* Department info */}
          <InfoCard title="Bo'lim ma'lumotlari">
            <InfoRow label="Rahbar"        value={dept.head_name ?? '—'} />
            <InfoRow label="Xodimlar soni" value={`${dept.employee_count} ta`} />
            <InfoRow label="Davr"          value={period} />
          </InfoCard>

          {/* KPI summary */}
          <InfoCard title="KPI ko'rsatkichi">
            <InfoRow label="O'rtacha KPI"   value={dept.avg_kpi != null ? dept.avg_kpi.toFixed(1) : '—'} />
            <InfoRow label="Top xodim"      value={dept.top_performer?.full_name ?? '—'} />
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Jami KPI</div>
              <div style={{ height: 8, background: 'var(--bg-subtle, #f1f3f6)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: 8, borderRadius: 5, width: `${dept.avg_kpi ?? 0}%`, background: '#4f46e5', transition: 'width .3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>100</span>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* ── Right content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <StatCard
              label="O'rtacha KPI"
              value={dept.avg_kpi != null ? dept.avg_kpi.toFixed(1) : '—'}
              sub={period}
              accent="#4f46e5"
            />
            <StatCard
              label="Xodimlar"
              value={String(dept.employee_count)}
              sub="Jami xodimlar"
            />
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8 }}>Top xodim</div>
              {dept.top_performer ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(dept.top_performer.full_name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                        {dept.top_performer.full_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#f5b301', fontWeight: 700, marginTop: 2 }}>⭐ 1-o'rin</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Plus Jakarta Sans'", color: 'var(--text-muted)' }}>—</div>
              )}
            </div>
          </div>

          {/* Indicator breakdown */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-heading)', marginBottom: 16 }}>
              KPI ko'rsatkichlari
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {IND_KEYS.map(k => (
                <IndicatorCard
                  key={k}
                  indKey={k}
                  avg={dept.indicator_breakdown[k].avg}
                  weight={dept.indicator_breakdown[k].weight}
                />
              ))}
            </div>
          </div>

          {/* Staff table */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-heading)' }}>
                Xodimlar ro'yxati
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                {dept.staff.length} ta
              </span>
            </div>

            {dept.staff.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5 }}>
                <div style={{ marginBottom: 8, fontSize: 32 }}>👥</div>
                Xodimlar mavjud emas
              </div>
            ) : (
              <>
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 1fr 100px 140px 100px',
                  padding: '0 16px', height: 40,
                  background: 'var(--bg-subtle)',
                  fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '.03em', textTransform: 'uppercase',
                  alignItems: 'center',
                }}>
                  <div>#</div>
                  <div>Ism</div>
                  <div>Lavozim</div>
                  <div style={{ textAlign: 'center' }}>Davomat</div>
                  <div>KPI ball</div>
                  <div>Daraja</div>
                </div>

                <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                  {dept.staff.map((member, i) => (
                    <StaffRow key={member.id} member={member} rank={i + 1} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
