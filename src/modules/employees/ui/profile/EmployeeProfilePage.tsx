import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmployeeAvatar } from '@shared/ui/EmployeeAvatar/EmployeeAvatar'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'
import { getEmployee } from '../../api/employees'
import type { ApiEmployee } from '../../model/employee.types'

export type EmployeeProfileContext = { emp: ApiEmployee }

const TABS = ['profile', 'leave', /* 'activities', */ 'assessments', /* 'incidents' */] as const

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
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

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '9px 16px', fontSize: 13.5, cursor: 'pointer',
        borderBottom: '2px solid',
        borderColor: active ? 'var(--accent)' : 'transparent',
        color: active ? 'var(--accent)' : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: active ? 600 : 400,
        transition: 'color .12s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  )
}

export function EmployeeProfilePage() {
  const { t } = useTranslation(['employees', 'common'])
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [emp, setEmp] = useState<ApiEmployee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getEmployee(id)
      .then(data => setEmp(data))
      .catch(() => setEmp(null))
      .finally(() => setLoading(false))
  }, [id])

  const activeTab = location.pathname.split('/').pop() ?? 'profile'

  const tabLabels: Record<string, string> = {
    profile:     t('profile.profile'),
    leave:       t('profile.leaveReq'),
    // activities:  t('profile.activities'),
    assessments: t('profile.assess'),
    // incidents:   t('profile.incidents'),
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
        {t('common:loading', 'Loading...')}
      </div>
    )
  }

  if (!emp) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
        {t('common:notFound', 'Employee not found')}
      </div>
    )
  }

  const positionName = emp.position?.name_uz ?? ''
  const deptName = emp.department?.name_uz ?? ''
  const supervisorName = emp.supervisor?.full_name ?? '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-color)', padding: '0 24px', display: 'flex', gap: 2 }}>
        {TABS.map(tab => (
          <Tab
            key={tab}
            label={tabLabels[tab]}
            active={activeTab === tab}
            onClick={() => navigate(`/employees/${id}/${tab}`)}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

          {/* Left sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Avatar card */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <EmployeeAvatar initials={emp.initials} size={72} fontSize={24} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 18, color: 'var(--text-heading)' }}>
                  {emp.first_name} {emp.last_name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{positionName}</div>
                <div style={{ marginTop: 10 }}>
                  <StatusBadge statusKey={emp.status} label={t(`common:status.${emp.status}`)} />
                </div>
              </div>
            </div>

            {/* Employee info */}
            <InfoCard title={t('profile.empInfo')}>
              <InfoRow label={t('profile.code')}     value={emp.code} />
              <InfoRow label={t('profile.nameF')}    value={emp.first_name} />
              <InfoRow label={t('profile.surnameF')} value={emp.last_name} />
              <InfoRow label={t('profile.gender')}   value={t(`common:gender.${emp.gender}`)} />
              <InfoRow label={t('profile.dob')}      value={emp.date_of_birth ?? '—'} />
              <InfoRow label={t('profile.phone')}    value={emp.phone || '—'} />
              <InfoRow label={t('profile.email')}    value={emp.email || '—'} />
            </InfoCard>

            {/* Employment info */}
            <InfoCard title={t('profile.employmentInfo')}>
              <InfoRow label={t('profile.deptF')}       value={deptName} />
              <InfoRow label={t('profile.positionF')}   value={positionName} />
              <InfoRow label={t('profile.supervisorF')} value={supervisorName} />
              <InfoRow label={t('profile.hireDate')}    value={emp.hire_date ?? '—'} />
            </InfoCard>
          </div>

          {/* Right: outlet */}
          <div style={{ minWidth: 0 }}>
            <Outlet context={{ emp } satisfies EmployeeProfileContext} />
          </div>
        </div>
      </div>
    </div>
  )
}
