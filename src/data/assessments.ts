import type { Assessment, Competency } from '@modules/assessments/model/assessment.types'

export const assessments: Assessment[] = [
  { id: 'A001', employeeName: 'Moxira Karimova',    startedDate: 'may 14, 2026', startedBy: 'Dilshod Rahmonov', reviewer: 'Nodira Saidova', totalScore: '100.00', departmentName: "Nevrologiya bo'limi",                        status: 'approved' },
  { id: 'A002', employeeName: 'Gulnora Tosheva',    startedDate: 'may 14, 2026', startedBy: 'Dilshod Rahmonov', reviewer: 'Nodira Saidova', totalScore: '98.75',  departmentName: "Allergologiya bo'limi",                       status: 'approved' },
  { id: 'A003', employeeName: 'Zarina Hamidova',    startedDate: 'may 13, 2026', startedBy: 'Gulnora Tosheva',  reviewer: 'Nodira Saidova', totalScore: '100.00', departmentName: "1-Umumiy pediatriya bo'limi",                  status: 'approved' },
  { id: 'A004', employeeName: "Malika Yo'ldosheva", startedDate: 'may 13, 2026', startedBy: 'Gulnora Tosheva',  reviewer: 'Nodira Saidova', totalScore: '98.75',  departmentName: "Gastroenterologiya bo'limi",                  status: 'approved' },
  { id: 'A005', employeeName: 'Dilnoza Saidova',    startedDate: 'may 12, 2026', startedBy: 'Dilshod Rahmonov', reviewer: 'Nodira Saidova', totalScore: '100.00', departmentName: "Gepatologiya bo'limi",                        status: 'approved' },
  { id: 'A006', employeeName: 'Mohira Xolmatova',   startedDate: 'may 12, 2026', startedBy: 'Gulnora Tosheva',  reviewer: 'Nodira Saidova', totalScore: '98.75',  departmentName: 'Bolalar Reanimatsiya bulimi',                  status: 'approved' },
  { id: 'A007', employeeName: 'Kamola Abdullayeva', startedDate: 'may 11, 2026', startedBy: 'Dilshod Rahmonov', reviewer: 'Nodira Saidova', totalScore: '97.50',  departmentName: "Chaqaloqlar patologiyasi bo'limi",             status: 'approved' },
  { id: 'A008', employeeName: 'Shaxnoza Ismoilova', startedDate: 'may 11, 2026', startedBy: 'Dilshod Rahmonov', reviewer: 'Nodira Saidova', totalScore: '97.50',  departmentName: "Fizioterapiya bo'limi",                       status: 'approved' },
  { id: 'A009', employeeName: 'Nigora Mirzayeva',   startedDate: 'may 10, 2026', startedBy: 'Gulnora Tosheva',  reviewer: 'Nodira Saidova', totalScore: '97.50',  departmentName: 'Umumiy pediatriya-2',                         status: 'approved' },
  { id: 'A010', employeeName: 'Aziza Boltayeva',    startedDate: 'may 10, 2026', startedBy: 'Bekzod Qodirov',  reviewer: 'Nodira Saidova', totalScore: '98.75',  departmentName: 'Dorixona',                                    status: 'approved' },
  { id: 'A011', employeeName: 'Sardor Aliyev',      startedDate: 'may 09, 2026', startedBy: 'Bekzod Qodirov',  reviewer: 'Nodira Saidova', totalScore: '96.25',  departmentName: "Bakteriologik laboratoriya bo'limi",           status: 'approved' },
  { id: 'A012', employeeName: "Ulug'bek Sodiqov",   startedDate: 'may 09, 2026', startedBy: 'Bekzod Qodirov',  reviewer: 'Nodira Saidova', totalScore: '96.25',  departmentName: "Klinik-diagnostik laboratoriya bo'limi",       status: 'approved' },
]

export const competenciesUz: Competency[] = [
  { title: "Aseptika va antiseptika qoidalariga rioya qilish", items: ["Qo'l gigienasiga rioya qilish va himoya vositalaridan to'g'ri foydalanish","Antiseptik vositalarni to'g'ri va kerakli miqdorda qo'llash","Aseptika/antiseptika qoidalari buzilganda favqulodda choralar ko'rish"], score: 100 },
  { title: "Markazning ichki mehnat qoidalariga va bo'lim ichki tartib talablariga rioya qilish", items: ["Ishga o'z vaqtida kelish va ish davomida ish joyini tark etmaslik","Ish joyida tashqi ko'rinish (forma, gigiena) talablariga javob berish","Ish vaqtida telefonda shaxsiy suhbatlarga yo'l qo'ymaslik"], score: 100 },
  { title: "Bemorlar bilan muloqot va parvarish sifati", items: ["Bemorlarga e'tiborli va xushmuomala munosabatda bo'lish","Bemor holatini muntazam kuzatib borish va hujjatlashtirish","Shifokor ko'rsatmalarini o'z vaqtida bajarish"], score: 95 },
  { title: "Tibbiy hujjatlarni yuritish", items: ["Hujjatlarni to'liq va o'z vaqtida to'ldirish","Ma'lumotlarni aniq va xatosiz kiritish"], score: 97.5 },
]

export const competenciesEn: Competency[] = [
  { title: "Compliance with aseptic and antiseptic rules", items: ["Hand hygiene and correct use of protective equipment","Proper and adequate use of antiseptic agents","Emergency measures when aseptic rules are breached"], score: 100 },
  { title: "Compliance with internal labor and departmental regulations", items: ["Arriving on time and not leaving the workplace during shifts","Meeting appearance standards (uniform, hygiene)","No personal phone calls during working hours"], score: 100 },
  { title: "Quality of patient communication and care", items: ["Attentive and courteous attitude toward patients","Regular monitoring and documentation of patient status","Timely execution of physician instructions"], score: 95 },
  { title: "Medical documentation", items: ["Complete and timely completion of records","Accurate and error-free data entry"], score: 97.5 },
]
