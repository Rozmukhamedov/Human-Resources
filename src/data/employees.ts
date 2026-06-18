import type { Employee } from '@modules/employees/model/employee.types'

const PHONES = ['+998 90 123 45 67', '+998 91 234 56 78', '+998 93 345 67 89', '+998 94 456 78 90', '+998 97 567 89 01']

function makeEmail(first: string, last: string) {
  return (first + '.' + last).toLowerCase().replace(/[^a-z.]/g, '') + '@kpi.uz'
}

function makePhone(id: string) {
  return PHONES[id.charCodeAt(4) % PHONES.length]
}

const RAW: [string, string, string, string, string, string, string, string, string, string, string][] = [
  ['C00257','MK','Moxira','Karimova',"Nevrologiya bo'limi","Katta hamshira","Dilshod Rahmonov","leave","Ayol","feb 14, 1991","jan 12, 2019"],
  ['C00312','AR','Aziz','Rahimov',"Jarroxlik reanimatsiya bo'limi","Shifokor-bakteriolog","Nodira Saidova","active","Erkak","may 22, 1988","mar 03, 2017"],
  ['C00188','GT','Gulnora','Tosheva',"Allergologiya bo'limi","Hamshira","Dilshod Rahmonov","active","Ayol","sep 09, 1993","aug 18, 2020"],
  ['C00421','SA','Sardor','Aliyev',"Bakteriologik laboratoriya bo'limi","Laborant-bakteriolog","Bekzod Qodirov","active","Erkak","nov 30, 1990","jun 01, 2018"],
  ['C00533','NS','Nodira','Saidova',"Kardiorevmotologiya bo'limi","Bo'lim mudiri","—","active","Ayol","jan 18, 1980","feb 10, 2012"],
  ['C00276','JE','Jasur','Ergashev',"Radiologiya bo'limi","Shifokor laborant","Otabek Nazarov","probation","Erkak","jul 07, 1996","apr 02, 2025"],
  ['C00390','MY','Malika',"Yo'ldosheva","Gastroenterologiya bo'limi","Hamshira","Gulnora Tosheva","active","Ayol","mar 25, 1992","oct 14, 2019"],
  ['C00604','BQ','Bekzod','Qodirov',"Markazlashtirilgan sterilizatsiya bo'limi","Bo'lim mudiri","—","active","Erkak","dec 02, 1978","jan 09, 2010"],
  ['C00219','SI','Shaxnoza','Ismoilova',"Fizioterapiya bo'limi","Hamshira","Dilshod Rahmonov","leave","Ayol","apr 11, 1994","may 21, 2021"],
  ['C00455','ON','Otabek','Nazarov',"Otorinolaringologiya bo'limi","Shifokor-bakteriolog","Nodira Saidova","active","Erkak","aug 16, 1985","sep 03, 2015"],
  ['C00322','ZH','Zarina','Hamidova',"1-Umumiy pediatriya bo'limi","Hamshira","Gulnora Tosheva","active","Ayol","may 25, 1995","jul 19, 2022"],
  ['C00501','FT','Farrux','Tursunov',"2-jarroxlik bo'limi","Sanitarka (tozalik sohibasi)","Bekzod Qodirov","active","Erkak","feb 28, 1989","mar 30, 2016"],
  ['C00287','KA','Kamola','Abdullayeva',"Chaqaloqlar patologiyasi bo'limi","Hamshira","Dilshod Rahmonov","probation","Ayol","oct 03, 1997","mar 15, 2025"],
  ["C00366","US","Ulug'bek","Sodiqov","Klinik-diagnostik laboratoriya bo'limi","Laborant-bakteriolog","Bekzod Qodirov","active","Erkak","jan 30, 1991","nov 11, 2018"],
  ['C00410','NM','Nigora','Mirzayeva','Umumiy pediatriya-2',"Katta hamshira","Gulnora Tosheva","active","Ayol","jun 12, 1987","feb 22, 2014"],
  ['C00298','DR','Dilshod','Rahmonov',"Nevrologiya bo'limi","Bo'lim mudiri","—","active","Erkak","mar 04, 1975","jan 15, 2008"],
  ['C00477','YM','Yuriy','Mozjuxin',"Bolalar Reanimatsiya va intensiv terapiya bulimi","Bolalar anesteziolog-reanimatologi","Nodira Saidova","active","Erkak","jul 21, 1986","apr 09, 2016"],
  ['C00345','DS','Dilnoza','Saidova',"Gepatologiya bo'limi","Hamshira","Dilshod Rahmonov","active","Ayol","sep 27, 1993","oct 30, 2020"],
  ["C00388","RT","Rustam","To'xtayev","Otorinolaringologiya reanimatsiya","Shifokor laborant","Otabek Nazarov","probation","Erkak","dec 14, 1998","apr 01, 2025"],
  ['C00512','MX','Mohira','Xolmatova',"Bolalar Reanimatsiya va intensiv terapiya bulimi","Hamshira","Gulnora Tosheva","active","Ayol","may 05, 1994","jul 07, 2021"],
  ['C00299','AB','Aziza','Boltayeva','Dorixona',"Farmatsevt","Bekzod Qodirov","active","Ayol","feb 19, 1990","aug 12, 2018"],
  ['C00444','ST','Sherzod','Tolipov',"Gastroenterologiya bo'limi","Shifokor-bakteriolog","Nodira Saidova","leave","Erkak","nov 08, 1984","mar 17, 2014"],
]

export const employees: Employee[] = RAW.map(r => ({
  id: r[0],
  code: r[0],
  initials: r[1],
  firstName: r[2],
  lastName: r[3],
  fullName: `${r[2]} ${r[3]}`,
  departmentId: null,
  departmentName: r[4],
  positionId: null,
  position: r[5],
  supervisorId: null,
  supervisorName: r[6],
  status: r[7] as Employee['status'],
  statusDisplay: r[7],
  gender: r[8] as Employee['gender'],
  genderRaw: (r[8] === 'Ayol' ? 'female' : 'male') as Employee['genderRaw'],
  dateOfBirth: r[9],
  hireDate: r[10],
  email: makeEmail(r[2], r[3]),
  phone: makePhone(r[0]),
}))
