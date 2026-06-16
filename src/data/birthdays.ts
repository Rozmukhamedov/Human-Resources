export interface BirthdayEntry {
  initials: string
  name: string
  department: string
  date: string
}

export const birthdays: BirthdayEntry[] = [
  { initials: 'GT', name: 'Gulnora Tosheva',  department: "Allergologiya bo'limi",                      date: '18 may' },
  { initials: 'YM', name: 'Yuriy Mozjuxin',   department: 'Bolalar Reanimatsiya bulimi',                date: '20 may' },
  { initials: 'AR', name: 'Aziz Rahimov',     department: 'Jarroxlik reanimatsiya',                     date: '22 may' },
  { initials: 'ZH', name: 'Zarina Hamidova',  department: "1-Umumiy pediatriya",                        date: '25 may' },
  { initials: 'FT', name: 'Farrux Tursunov',  department: "2-jarroxlik bo'limi",                        date: '28 may' },
]

export const deptBars = [
  { name: "Kadrlar bo'limi",     count: 4   },
  { name: "Umumiy bo'lim",       count: 7   },
  { name: 'Bakteriologik lab.',  count: 11  },
  { name: 'Fizioterapiya',       count: 17  },
  { name: 'Radiologiya',         count: 23  },
  { name: 'Nevrologiya',         count: 28  },
  { name: 'Gastroenterologiya',  count: 30  },
  { name: 'Jarroxlik reanim.',   count: 31  },
  { name: "Chaqaloqlar pat.",    count: 34  },
  { name: 'Gepatologiya',        count: 46  },
  { name: "2-jarroxlik",         count: 60  },
  { name: 'Otorinolaringol.',    count: 126 },
]
