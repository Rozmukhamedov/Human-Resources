import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assessments, competenciesUz, competenciesEn } from '@data/assessments'
import { useUIStore } from '@core/store/uiStore'
import { StatusBadge } from '@shared/ui/StatusBadge/StatusBadge'

export function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['assessments', 'common'])
  const navigate = useNavigate()
  const { lang } = useUIStore()

  const assessment = assessments.find(a => a.id === id) ?? assessments[0]
  const comps = lang === 'uz' ? competenciesUz : competenciesEn

  return (
    <div style={{ padding: '18px 24px 40px', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/assessments')} style={{ background: 'none', border: '1px solid #eceef2', borderRadius: 9, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#5b6270' }}>← {t('common:titles.assessments')}</button>
        <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 18, color: '#2a2f3a' }}>{t('common:titles.assessmentDetail')} — {assessment.employeeName}</div>
        <StatusBadge statusKey={assessment.status} label={t(`common:status.${assessment.status}`)} />
      </div>

      {/* Base details */}
      <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: 16, padding: 22, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#2a2f3a', marginBottom: 16 }}>{t('baseDetails')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {[
            { label: t('employee'), value: assessment.employeeName },
            { label: t('dept'), value: assessment.departmentName },
            { label: t('started'), value: assessment.startedDate },
            { label: t('startedBy'), value: assessment.startedBy },
            { label: t('reviewers'), value: assessment.reviewer },
            { label: t('validity'), value: t('period') },
            { label: t('template'), value: t('tpl') },
            { label: t('totalScore'), value: assessment.totalScore },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#a3a9b4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
              <span style={{ fontSize: 13.5, color: '#2a2f3a', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Competencies */}
      <div style={{ background: '#fff', border: '1px solid #ebedf1', borderRadius: 16, padding: 22 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#2a2f3a', marginBottom: 16 }}>{t('competencies')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comps.map((comp, i) => (
            <div key={i} style={{ border: '1px solid #f0f1f4', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: '#2a2f3a' }}>{comp.title}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 22, color: 'var(--accent,#4f46e5)', flexShrink: 0 }}>{comp.score}</div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {comp.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 13, color: '#5b6270' }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--accent-soft,#eef2ff)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: '#2a2f3a' }}>{t('overall')}</span>
          <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 24, color: 'var(--accent,#4f46e5)' }}>{assessment.totalScore}</span>
        </div>
      </div>
    </div>
  )
}
