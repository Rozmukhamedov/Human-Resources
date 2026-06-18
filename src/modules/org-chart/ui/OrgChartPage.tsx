import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@core/i18n'
import type { OrgNode, OrgStructureDivision, SupervisorNode } from '@modules/org-chart/model/org.types'
import { getOrgStructure, getSupervisorTree } from '@modules/org-chart/api/orgChart'

const LINE = '#dde1e9'
const VH = 30
const MIN_ZOOM = 0.2
const MAX_ZOOM = 2.5

function safeHexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return `rgba(79,70,229,${alpha})`
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function transformOrgData(divisions: OrgStructureDivision[], lang: string): OrgNode {
  const getName = (d: { name_uz: string; name_en: string }) =>
    lang === 'uz' ? d.name_uz : d.name_en

  return {
    id: 'root',
    initials: 'ORG',
    name: i18n.t('common:orgChart.organization'),
    role: i18n.t('common:orgChart.divCount', { count: divisions.length }),
    avatarBg: 'rgba(79,70,229,0.12)',
    avatarColor: '#4f46e5',
    children: divisions.map(div => ({
      id: String(div.id),
      initials: getName(div).slice(0, 2).toUpperCase(),
      name: getName(div),
      role: i18n.t('common:orgChart.deptCount', { count: div.department_count }),
      avatarBg: safeHexToRgba(div.color, 0.15),
      avatarColor: /^#[0-9a-fA-F]{6}$/.test(div.color) ? div.color : '#4f46e5',
      children: div.departments.map(dep => ({
        id: String(dep.id),
        initials: dep.head_initials ?? getName(dep).slice(0, 2).toUpperCase(),
        name: getName(dep),
        role: i18n.t('common:orgChart.empCount', { count: dep.employee_count }),
        avatarBg: '#f0f1f5',
        avatarColor: '#4a5568',
      })),
    })),
  }
}

const AVATAR_PALETTE = [
  { bg: '#e8f0fe', color: '#4f46e5' },
  { bg: '#ede9fe', color: '#7c3aed' },
  { bg: '#d1fae5', color: '#059669' },
  { bg: '#fef3c7', color: '#d97706' },
  { bg: '#fce7f3', color: '#db2777' },
  { bg: '#fee2e2', color: '#dc2626' },
]

function transformSupervisorNode(node: SupervisorNode, lang: string): OrgNode {
  const { bg, color } = AVATAR_PALETTE[node.id % AVATAR_PALETTE.length]
  const role = lang === 'uz'
    ? node.position_uz
    : (node.position_en || node.position_uz)
  return {
    id: String(node.id),
    initials: node.initials,
    name: node.full_name,
    role,
    avatarBg: bg,
    avatarColor: color,
    children: node.children.map(child => transformSupervisorNode(child, lang)),
  }
}

function transformSupervisorData(nodes: SupervisorNode[], lang: string): OrgNode {
  if (nodes.length === 1) return transformSupervisorNode(nodes[0], lang)
  return {
    id: 'root',
    initials: 'ORG',
    name: i18n.t('common:orgChart.organization'),
    role: '',
    avatarBg: '#e8f0fe',
    avatarColor: '#4f46e5',
    children: nodes.map(n => transformSupervisorNode(n, lang)),
  }
}

const STYLES = `
  .org-card {
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .org-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.13) !important;
    border-color: #c5cad8 !important;
  }
  .org-child::before,
  .org-child::after {
    content: '';
    position: absolute;
    top: 0;
    height: 2px;
    background: ${LINE};
    pointer-events: none;
  }
  .org-child::before { left: 0; right: 50%; }
  .org-child::after  { left: 50%; right: 0; }
  .org-child:first-child::before { display: none; }
  .org-child:last-child::after   { display: none; }
  .org-child:only-child::before,
  .org-child:only-child::after   { display: none; }
  .zoom-btn {
    background: #fff;
    border: 1.5px solid #e4e7ef;
    border-radius: 8px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 17px;
    color: #4a5568;
    padding: 0;
    line-height: 1;
    transition: background 0.12s, border-color 0.12s;
    flex-shrink: 0;
  }
  .zoom-btn:hover {
    background: #f5f6fa;
    border-color: #bfc5d4;
  }
  .reset-btn {
    background: #fff;
    border: 1.5px solid #e4e7ef;
    border-radius: 8px;
    height: 30px;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 500;
    color: #4a5568;
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s;
    font-family: inherit;
  }
  .reset-btn:hover {
    background: #f5f6fa;
    border-color: #bfc5d4;
  }
`

function OrgNodeCard({ node, isRoot = false }: { node: OrgNode; isRoot?: boolean }) {
  const hasChildren = (node.children?.length ?? 0) > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        className="org-card"
        style={{
          background: '#fff',
          border: isRoot ? '2px solid #4f46e5' : '1.5px solid #e8eaee',
          borderRadius: 14,
          padding: '13px 18px 13px 14px',
          minWidth: 196,
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          boxShadow: isRoot
            ? '0 6px 24px rgba(79,70,229,0.18)'
            : '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: node.avatarBg, color: node.avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}
        >
          {node.initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1f2e', whiteSpace: 'nowrap' }}>
            {node.name}
          </div>
          <div style={{ fontSize: 11.5, color: '#8794a8', marginTop: 2, whiteSpace: 'nowrap' }}>
            {node.role}
          </div>
        </div>
      </div>

      {hasChildren && (
        <>
          <div style={{ width: 2, height: VH, background: LINE }} />
          <div style={{ display: 'flex' }}>
            {node.children!.map(child => (
              <div
                key={child.id}
                className="org-child"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '0 16px', position: 'relative',
                }}
              >
                <div style={{ width: 2, height: VH, background: LINE }} />
                <OrgNodeCard node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface Props { mode: 'supervisor' | 'org' }

export function OrgChartPage({ mode }: Props) {
  const { t, i18n } = useTranslation(['orgChart', 'common'])
  const title = mode === 'supervisor'
    ? t('common:titles.supervisorStruct')
    : t('common:titles.orgStruct')

  const [zoom, setZoom] = useState(0.85)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [orgData, setOrgData] = useState<OrgNode | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const dragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left - rect.width / 2
      const my = e.clientY - rect.top - rect.height / 2
      const factor = e.deltaY < 0 ? 1.12 : 0.9

      setZoom(oz => {
        const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oz * factor))
        const ratio = nz / oz
        setPan(op => ({ x: mx + (op.x - mx) * ratio, y: my + (op.y - my) * ratio }))
        return nz
      })
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    dragging.current = true
    setIsDragging(true)
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }
    setPan(p => ({ x: p.x + dx, y: p.y + dy }))
  }, [])

  const onMouseUp = useCallback(() => {
    dragging.current = false
    setIsDragging(false)
  }, [])

  useEffect(() => {
    setLoading(true)
    setFetchError(null)
    setOrgData(null)
    const promise = mode === 'org'
      ? getOrgStructure().then(data => transformOrgData(data, i18n.language))
      : getSupervisorTree().then(data => transformSupervisorData(data, i18n.language))
    promise
      .then(setOrgData)
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false))
  }, [mode, i18n.language])

  const rootNode = orgData

  const zoomIn  = () => setZoom(z => Math.min(MAX_ZOOM, z + 0.15))
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z - 0.15))
  const reset   = () => { setZoom(0.85); setPan({ x: 0, y: 0 }) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 520, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f0f1f5',
        background: '#fff',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#2a2f3a' }}>{title}</div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="zoom-btn" onClick={zoomIn} title="Zoom in">+</button>
          <span style={{
            fontSize: 12, color: '#8794a8', minWidth: 44, textAlign: 'center', fontWeight: 500,
          }}>
            {Math.round(zoom * 100)}%
          </span>
          <button className="zoom-btn" onClick={zoomOut} title="Zoom out" style={{ fontSize: 20 }}>−</button>
          <div style={{ width: 1, height: 20, background: '#e8eaee', margin: '0 2px' }} />
          <button className="reset-btn" onClick={reset}>{t('common:orgChart.reset')}</button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          background: '#f3f4f7',
          backgroundImage: 'radial-gradient(circle, #c8cdd9 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#8794a8', fontSize: 14 }}>{t('common:orgChart.loading')}</div>
          </div>
        )}

        {fetchError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: 14 }}>{fetchError}</div>
          </div>
        )}

        {!loading && !fetchError && rootNode && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
              transformOrigin: 'center center',
              userSelect: 'none',
              pointerEvents: isDragging ? 'none' : 'auto',
            }}
          >
            <OrgNodeCard node={rootNode} isRoot />
          </div>
        )}

        {/* Hint */}
        {!isDragging && (
          <div style={{
            position: 'absolute',
            bottom: 16, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30,33,42,0.62)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            fontSize: 12,
            padding: '6px 14px',
            borderRadius: 20,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            opacity: 0.85,
          }}>
            {t('common:orgChart.hint')}
          </div>
        )}
      </div>
    </div>
  )
}
