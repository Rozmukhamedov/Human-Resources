import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmployeeAvatar } from '@shared/ui/EmployeeAvatar/EmployeeAvatar'
import { getDashboard } from '../api/dashboard'
import type { DashboardData } from '../model/dashboard.types'

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: 16, padding: '18px 20px' }}>
      <div style={{ fontSize: 12.5, color: '#8d94a0', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 30, color, marginTop: 10, letterSpacing: '-.02em' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#a3a9b4', marginTop: 2 }}>{sub}</div>
    </div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common'])
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '18px 24px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <div style={{ color: '#8d94a0', fontSize: 14 }}>{t('loading', { ns: 'common' })}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '18px 24px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <div style={{ color: '#d97706', fontSize: 14 }}>{t('error', { ns: 'common' })}</div>
      </div>
    )
  }

  const { stat_cards, schedule_overview, not_filled_departments, employees_by_department, upcoming_birthdays } = data
  const maxBar = Math.max(...employees_by_department.map(d => d.employee_count), 1)

  const scheduleTotal = schedule_overview.total || 1
  const approvedPct = (schedule_overview.approved / scheduleTotal) * 100
  const submittedPct = (schedule_overview.submitted / scheduleTotal) * 100

  return (
    <div style={{ padding: '18px 24px 40px' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 18 }}>
        <StatCard label={t('statCards.totalEmps', { ns: 'dashboard' })} value={stat_cards.total_employees} sub={t('status.active', { ns: 'common' })} color="#2a2f3a" />
        <StatCard label={t('statCards.totalScore', { ns: 'dashboard' })} value={stat_cards.avg_kpi_score} sub="KPI" color="var(--accent,#4f46e5)" />
        <StatCard label={t('totalDepts', { ns: 'dashboard' })} value={stat_cards.total_departments} sub={`${stat_cards.filled_departments} ${t('status.active', { ns: 'common' }).toLowerCase()}`} color="#d97706" />
        <StatCard label={t('notFilledList', { ns: 'dashboard' })} value={stat_cards.not_filled_departments} sub={t('total', { ns: 'dashboard' })} color="#5b6270" />
      </div>

      {/* Weather + Birthdays row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, marginBottom: 18 }}>
        {/* Weather + Mail */}
        <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: 16, padding: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#2a2f3a' }}>{t('today', { ns: 'dashboard' })}</div>
            <div style={{ fontSize: 12, color: '#9aa1ad', marginTop: 2 }}>{t('country', { ns: 'dashboard' })}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
              <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="#9cb4e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 1 0 5 19z" fill="#dde7fa" stroke="#9cb4e8"/></svg>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 36, fontWeight: 800, color: '#2a2f3a', lineHeight: 1 }}>28°</div>
                <div style={{ fontSize: 12, color: '#9aa1ad', marginTop: 4 }}>{t('clouds', { ns: 'dashboard' })}</div>
              </div>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #f0f1f4', paddingLeft: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#2a2f3a' }}>{t('mail', { ns: 'dashboard' })}</div>
            <div style={{ fontSize: 12, color: '#9aa1ad', marginTop: 2 }}>{t('mailNone', { ns: 'dashboard' })}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b9c0cc" strokeWidth="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 30, fontWeight: 800, color: 'var(--accent,#4f46e5)', lineHeight: 1 }}>0</div>
                <div style={{ fontSize: 12, color: '#9aa1ad', marginTop: 4 }}>{t('unread', { ns: 'dashboard' })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Birthdays */}
        <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: 16, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#4f46e5)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3M12 8v3M17 8v3M7 4h.01M12 3h.01M17 4h.01"/></svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#2a2f3a' }}>{t('birthday', { ns: 'dashboard' })}</div>
              <div style={{ fontSize: 11.5, color: '#9aa1ad' }}>{t('birthdaySub', { ns: 'dashboard' })}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8, maxHeight: 170, overflowY: 'auto' }}>
            {upcoming_birthdays.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 6px', borderRadius: 9 }}>
                <EmployeeAvatar initials={b.initials} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2a2f3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.full_name}</div>
                  <div style={{ fontSize: 11.5, color: '#9aa1ad', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.department}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent,#4f46e5)', whiteSpace: 'nowrap' }}>{b.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donut + Not-filled table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: 16, padding: '20px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#2a2f3a', marginBottom: 6 }}>{t('scheduleStatus', { ns: 'dashboard' })}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
              <div style={{ width: 170, height: 170, borderRadius: '50%', background: `conic-gradient(var(--accent,#4f46e5) 0 ${approvedPct}%, #f59e0b ${approvedPct}% ${approvedPct + submittedPct}%, #94a3b8 ${approvedPct + submittedPct}% 100%)` }} />
              <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 34, fontWeight: 800, color: '#2a2f3a', lineHeight: 1 }}>{schedule_overview.total}</div>
                <div style={{ fontSize: 11, color: '#9aa1ad' }}>{t('totalDepts', { ns: 'dashboard' })}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { color: 'var(--accent,#4f46e5)', label: t('status.approved', { ns: 'common' }), count: schedule_overview.approved },
                { color: '#f59e0b', label: t('status.submitted', { ns: 'common' }), count: schedule_overview.submitted },
                { color: '#94a3b8', label: t('status.notCreated', { ns: 'common' }), count: schedule_overview.not_created },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#5b6270', flex: 1 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: '#2a2f3a' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: 16, padding: '20px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#2a2f3a', marginBottom: 12 }}>{t('notFilledList', { ns: 'dashboard' })}</div>
          <div style={{ display: 'flex', fontSize: 11, fontWeight: 700, color: '#a3a9b4', letterSpacing: '.05em', textTransform: 'uppercase', padding: '0 4px 8px', borderBottom: '1px solid #f0f1f4' }}>
            <span style={{ width: 34 }}>#</span><span style={{ flex: 1 }}>{t('total', { ns: 'dashboard' })}</span><span>{t('statCards.totalEmps', { ns: 'dashboard' })}</span>
          </div>
          {not_filled_departments.map((dept, i) => (
            <div key={dept.id} style={{ display: 'flex', alignItems: 'center', padding: '11px 4px', borderBottom: i < not_filled_departments.length - 1 ? '1px solid #f4f5f7' : undefined }}>
              <span style={{ width: 34, color: '#a3a9b4', fontSize: 13 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13, color: '#3a4150' }}>{dept.name_uz}</span>
              <span style={{ fontWeight: 700, color: '#2a2f3a' }}>{dept.employee_count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: 16, padding: '20px 22px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#2a2f3a', marginBottom: 22 }}>{t('empByDept', { ns: 'dashboard' })}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 220, paddingLeft: 6 }}>
          {employees_by_department.map(dept => (
            <div key={dept.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 8, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5b6270' }}>{dept.employee_count}</div>
              <div style={{ width: '100%', borderRadius: '7px 7px 0 0', height: `${Math.max(6, Math.round(dept.employee_count / maxBar * 100))}%`, background: `var(--accent,#4f46e5)`, opacity: 0.55 + (dept.employee_count / maxBar) * 0.45 }} />
              <div style={{ fontSize: 10, color: '#a3a9b4', textAlign: 'center', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 64, overflow: 'hidden' }}>{dept.name_uz}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
