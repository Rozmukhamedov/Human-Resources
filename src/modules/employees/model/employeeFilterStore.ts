import { create } from 'zustand'

interface FilterState {
  query: string
  filterDept: string
  sortKey: string
  sortDir: 1 | -1
  sel: Record<string, boolean>
  allSel: boolean
  page: number
  setQuery: (q: string) => void
  setFilterDept: (d: string) => void
  toggleSort: (key: string) => void
  toggleSel: (id: string) => void
  toggleAllSel: (ids: string[]) => void
  setPage: (p: number) => void
  resetFilters: () => void
}

export const useEmployeeFilterStore = create<FilterState>()((set) => ({
  query: '',
  filterDept: 'all',
  sortKey: 'firstName',
  sortDir: 1,
  sel: {},
  allSel: false,
  page: 1,
  setQuery: (query) => set({ query, page: 1 }),
  setFilterDept: (filterDept) => set({ filterDept, page: 1 }),
  toggleSort: (key) => set((s) => ({
    sortKey: key,
    sortDir: s.sortKey === key ? (s.sortDir === 1 ? -1 : 1) : 1,
  })),
  toggleSel: (id) => set((s) => ({ sel: { ...s.sel, [id]: !s.sel[id] } })),
  toggleAllSel: (ids) => set((s) => {
    const next = !s.allSel
    const sel: Record<string, boolean> = {}
    if (next) ids.forEach((id) => (sel[id] = true))
    return { allSel: next, sel }
  }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ query: '', filterDept: 'all', sortKey: 'firstName', sortDir: 1, sel: {}, allSel: false, page: 1 }),
}))
