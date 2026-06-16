import type { OrgNode } from '@modules/org-chart/model/org.types'

export const orgRoot: OrgNode = {
  id: 'DR',
  initials: 'DR',
  name: 'Dilshod Rahmonov',
  role: "Bo'lim mudiri",
  avatarBg: '#4f46e5',
  avatarColor: '#fff',
  children: [
    {
      id: 'NS',
      initials: 'NS',
      name: 'Nodira Saidova',
      role: 'Shifokor-bakteriolog',
      avatarBg: '#e7f7ee',
      avatarColor: '#0f9d58',
      children: [
        { id: 'AR', initials: 'AR', name: 'Aziz Rahimov',    role: 'Shifokor-bakteriolog',  avatarBg: '#eef2ff', avatarColor: '#4f46e5' },
        { id: 'ON', initials: 'ON', name: 'Otabek Nazarov',  role: 'Shifokor-bakteriolog',  avatarBg: '#eef2ff', avatarColor: '#4f46e5' },
        { id: 'YM', initials: 'YM', name: 'Yuriy Mozjuxin',  role: 'Anesteziolog-reanimatolog', avatarBg: '#eef2ff', avatarColor: '#4f46e5' },
      ],
    },
    {
      id: 'GT',
      initials: 'GT',
      name: 'Gulnora Tosheva',
      role: 'Hamshira',
      avatarBg: '#fdf3e3',
      avatarColor: '#d97706',
      children: [
        { id: 'MY', initials: 'MY', name: "Malika Yo'ldosheva", role: 'Hamshira',         avatarBg: '#eef0f3', avatarColor: '#5b6270' },
        { id: 'ZH', initials: 'ZH', name: 'Zarina Hamidova',    role: 'Hamshira',         avatarBg: '#eef0f3', avatarColor: '#5b6270' },
        { id: 'NM', initials: 'NM', name: 'Nigora Mirzayeva',   role: "Katta hamshira",   avatarBg: '#eef0f3', avatarColor: '#5b6270' },
        { id: 'MX', initials: 'MX', name: 'Mohira Xolmatova',   role: 'Hamshira',         avatarBg: '#eef0f3', avatarColor: '#5b6270' },
      ],
    },
    {
      id: 'BQ',
      initials: 'BQ',
      name: 'Bekzod Qodirov',
      role: "Bo'lim mudiri",
      avatarBg: '#f5f1ff',
      avatarColor: '#7c3aed',
      children: [
        { id: 'SA', initials: 'SA', name: 'Sardor Aliyev',     role: 'Laborant-bakteriolog', avatarBg: '#eef0f3', avatarColor: '#5b6270' },
        { id: 'US', initials: 'US', name: "Ulug'bek Sodiqov",  role: 'Laborant-bakteriolog', avatarBg: '#eef0f3', avatarColor: '#5b6270' },
        { id: 'FT', initials: 'FT', name: 'Farrux Tursunov',   role: 'Sanitarka',            avatarBg: '#eef0f3', avatarColor: '#5b6270' },
        { id: 'AB', initials: 'AB', name: 'Aziza Boltayeva',   role: 'Farmatsevt',           avatarBg: '#eef0f3', avatarColor: '#5b6270' },
      ],
    },
  ],
}
