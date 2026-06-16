export interface OrgNode {
  id: string
  initials: string
  name: string
  role: string
  avatarBg: string
  avatarColor: string
  children?: OrgNode[]
}
