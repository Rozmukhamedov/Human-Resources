import type { ShiftStatus } from '@modules/shifts/model/shift.types'

export interface LocalShiftSchedule {
  id: string
  departmentName: string
  status: ShiftStatus
  month: string
  createdBy: string
}

export const shiftSchedules: LocalShiftSchedule[] = [
  { id: 'SH0239', departmentName: "Chaqaloqlar patologiyasi reanimatsiya bo'limi",              status: 'approved', month: 'may 2026', createdBy: 'Dilshod Rahmonov' },
  { id: 'SH0238', departmentName: "Oy kuniga yetmay tug'ilgan chaqaloqlarni parvarishlash bo'limi", status: 'approved', month: 'may 2026', createdBy: 'Nodira Saidova'  },
  { id: 'SH0237', departmentName: 'Bolalar Reanimatsiya va intensiv terapiya bulimi',            status: 'approved', month: 'may 2026', createdBy: 'Nodira Saidova'  },
  { id: 'SH0236', departmentName: "1-Umumiy pediatriya bo'limi",                                 status: 'approved', month: 'may 2026', createdBy: 'Gulnora Tosheva' },
  { id: 'SH0235', departmentName: "Gepatologiya bo'limi",                                        status: 'approved', month: 'may 2026', createdBy: 'Dilshod Rahmonov' },
  { id: 'SH0234', departmentName: "Fizioterapiya bo'limi",                                       status: 'approved', month: 'may 2026', createdBy: 'Dilshod Rahmonov' },
  { id: 'SH0233', departmentName: "Gastroenterologiya bo'limi",                                  status: 'approved', month: 'may 2026', createdBy: 'Gulnora Tosheva' },
  { id: 'SH0232', departmentName: "Markazlashtirilgan sterilizatsiya bo'limi",                   status: 'approved', month: 'may 2026', createdBy: 'Bekzod Qodirov' },
  { id: 'SH0231', departmentName: "Jarroxlik reanimatsiya bo'limi",                              status: 'approved', month: 'may 2026', createdBy: 'Nodira Saidova'  },
  { id: 'SH0230', departmentName: "Allergologiya bo'limi",                                       status: 'approved', month: 'may 2026', createdBy: 'Dilshod Rahmonov' },
  { id: 'SH0229', departmentName: 'Umumiy pediatriya-2',                                         status: 'approved', month: 'may 2026', createdBy: 'Gulnora Tosheva' },
  { id: 'SH0228', departmentName: "2-jarroxlik bo'limi",                                         status: 'approved', month: 'may 2026', createdBy: 'Bekzod Qodirov' },
  { id: 'SH0227', departmentName: "Kardiorevmotologiya bo'limi",                                 status: 'approved', month: 'may 2026', createdBy: 'Nodira Saidova'  },
  { id: 'SH0226', departmentName: "Chaqaloqlar patologiyasi bo'limi",                            status: 'approved', month: 'may 2026', createdBy: 'Dilshod Rahmonov' },
  { id: 'SH0225', departmentName: "Kichik yoshdagi bolalar patologiyasi bo'limi",                status: 'pending',  month: 'may 2026', createdBy: 'Gulnora Tosheva' },
  { id: 'SH0224', departmentName: "Otorinolaringologiya bo'limi",                                status: 'approved', month: 'may 2026', createdBy: 'Otabek Nazarov' },
  { id: 'SH0223', departmentName: 'Maslahat-tashxis poliklinika',                                status: 'approved', month: 'may 2026', createdBy: 'Nodira Saidova'  },
  { id: 'SH0222', departmentName: "Bakteriologik laboratoriya bo'limi",                          status: 'approved', month: 'may 2026', createdBy: 'Bekzod Qodirov' },
]
