import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(
      '❌ مثال الاستخدام:\n' +
      '.npm sharp\n' +
      '.npm axios@1.5.0\n' +
      '.npm sharp | axios@1.5.0 | lodash'
    )
  }

  const pkgPath = path.join(process.cwd(), 'package.json')

  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  } catch {
    return m.reply('❌ لم أستطع قراءة package.json')
  }

  pkg.dependencies = pkg.dependencies || {}

  const libs = text.split('|').map(v => v.trim()).filter(Boolean)
  const added = []

  for (const lib of libs) {
    const [name, version] = lib.split('@')
    pkg.dependencies[name] = version || 'latest'
    added.push(`${name}@${version || 'latest'}`)
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

  await conn.sendMessage(m.chat, {
    document: fs.readFileSync(pkgPath),
    mimetype: 'application/json',
    fileName: 'package.json',
    caption:
      `✅ تم تحديث package.json بالمكتبات التالية:\n` +
      added.join('\n') +
      `\n\n⬇️ حمّل الملف ثم شغّل:\n npm install`
  }, { quoted: m })
}
handler.help = ['npm <lib>']
handler.tags = ['owner']
handler.command = /^npm$/i
handler.owner = true

export default handler