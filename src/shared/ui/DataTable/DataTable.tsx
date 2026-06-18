import { useState, useEffect, type ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render: (row: T) => ReactNode
}

interface Props<T> {
  title?: string
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  headerRight?: ReactNode
  emptyText?: string
  loading?: boolean
  paginated?: boolean
  defaultPageSize?: number
  /** Server-side pagination — pass these to take over paging controls */
  serverSide?: boolean
  totalCount?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

function PageBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 32,
        height: 32,
        padding: '0 8px',
        borderRadius: 8,
        border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border-color)',
        background: active
          ? 'var(--accent)'
          : hovered && !disabled
          ? 'var(--bg-subtle)'
          : 'transparent',
        color: active ? '#fff' : disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background .1s, border-color .1s, color .1s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </button>
  )
}

export function DataTable<T>({
  title,
  columns,
  rows = [],
  rowKey,
  onRowClick,
  headerRight,
  emptyText = '—',
  loading = false,
  paginated = false,
  defaultPageSize = 10,
  serverSide = false,
  totalCount,
  page: controlledPage,
  pageSize: controlledPageSize,
  onPageChange,
}: Props<T>) {
  const [hoveredKey, setHoveredKey] = useState<string | number | null>(null)
  const [internalPage, setInternalPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const isServerSide = serverSide && onPageChange != null

  const page = isServerSide ? (controlledPage ?? 1) : internalPage
  const effectivePageSize = isServerSide ? (controlledPageSize ?? pageSize) : pageSize
  const totalItems = isServerSide ? (totalCount ?? rows.length) : rows.length

  // Reset to page 1 when filtered rows count changes (client-side only)
  useEffect(() => {
    if (!isServerSide) setInternalPage(1)
  }, [rows.length, isServerSide])

  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / effectivePageSize)) : 1
  const safePage = Math.min(page, totalPages)
  const displayRows = paginated && !isServerSide
    ? rows.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize)
    : rows

  const from = totalItems === 0 ? 0 : (safePage - 1) * effectivePageSize + 1
  const to = Math.min(safePage * effectivePageSize, totalItems)

  const handlePageChange = (p: number) => {
    if (isServerSide) onPageChange?.(p)
    else setInternalPage(p)
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {(title || headerRight) && (
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          {title && (
            <span style={{
              fontFamily: "'Plus Jakarta Sans'",
              fontWeight: 700,
              fontSize: 16,
              color: 'var(--text-heading)',
              letterSpacing: '-.01em',
              flexShrink: 0,
            }}>
              {title}
            </span>
          )}
          {headerRight}
        </div>
      )}

      <div style={{ overflowX: 'auto', opacity: loading ? 0.5 : 1, transition: 'opacity .15s' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{
                    padding: '10px 16px',
                    textAlign: col.align ?? 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && displayRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Loading...
                </td>
              </tr>
            ) : displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '48px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                  }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : displayRows.map(row => {
              const key = rowKey(row)
              const hovered = hoveredKey === key
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    background: hovered ? 'var(--bg-subtle)' : 'transparent',
                    transition: 'background .1s',
                  }}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding: '13px 16px',
                        textAlign: col.align ?? 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {paginated && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderTop: '1px solid var(--border-color)',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          {/* Left: page size + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isServerSide && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  Rows per page:
                </span>
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setInternalPage(1) }}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    background: 'var(--bg-subtle)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 7,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {from}–{to} of {totalItems}
            </span>
          </div>

          {/* Right: page buttons */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PageBtn
                label={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                }
                disabled={safePage === 1}
                onClick={() => handlePageChange(Math.max(1, safePage - 1))}
              />
              {getPageNumbers(safePage, totalPages).map((n, i) =>
                n === '...'
                  ? (
                    <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
                  )
                  : (
                    <PageBtn
                      key={n}
                      label={n}
                      active={n === safePage}
                      onClick={() => handlePageChange(n as number)}
                    />
                  )
              )}
              <PageBtn
                label={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                }
                disabled={safePage === totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, safePage + 1))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
