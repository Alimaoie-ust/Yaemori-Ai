import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  // تحقق أن هناك رد على رسالة
  if (!m.quoted) return m.reply('❌ رد على ملف js أولاً')

  // تحقق أن الملف هو document
  let q = m.quoted
  let mime = q.mimetype || ''

  if (!/javascript/.test(mime)) 
    return m.reply('❌ الملف يجب أن يكون بصيغة .js')

  // اسم الملف
  let fileName = q.fileName || 'plugin.js'
  if (!fileName.endsWith('.js')) 
    return m.reply('❌ الملف ليس JavaScript')

  // تحميل الملف
  let buffer = await q.download()
  if (!buffer) return m.reply('❌ فشل تحميل الملف')

  // مسار الحفظ
  let filePath = path.join('./plugins', fileName)

  // حفظ الملف
  fs.writeFileSync(filePath, buffer)

  m.reply(`✅ تم رفع الملف بنجاح\n📂 المسار: plugins/${fileName}`)
}

handler.command = ['up']
handler.owner = true // فقط المالك
handler.tags = ['owner']
handler.help = ['up (رفع plugin js)']

export default handler