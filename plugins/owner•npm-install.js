import fs from 'fs'
import path from 'path'

/* مكتبات Node المدمجة (ممنوع إضافتها) */
const NODE_BUILTINS = new Set([
  'fs', 'path', 'stream', 'child_process', 'http', 'https',
  'crypto', 'url', 'os', 'events', 'util', 'buffer',
  'timers', 'zlib', 'net', 'tls', 'dns', 'readline',
  'perf_hooks', 'assert', 'tty', 'vm', 'worker_threads'
])

/* namespaces الممنوعة */
const FORBIDDEN_SCOPES = new Set([
  '@adiwajshing' // ليس مكتبة، فقط namespace
])

let handler = async (m, { conn }) => {
  const base = process.cwd()
  const pkgPath = path.join(base, 'package.json')

  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  } catch {
    return m.reply('❌ لم أستطع قراءة package.json')
  }

  pkg.dependencies = pkg.dependencies || {}

  const pluginsDir = path.join(base, 'plugins')
  if (!fs.existsSync(pluginsDir)) {
    return m.reply('❌ مجلد plugins غير موجود')
  }

  const usedLibs = new Set()
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

  for (const file of files) {
    const content = fs.readFileSync(path.join(pluginsDir, file), 'utf-8')
    const regex = /import\s+.*?from\s+['"](.+?)['"]|require\(['"](.+?)['"]\)/g
    let match

    while ((match = regex.exec(content))) {
      const lib = match[1] || match[2]
      if (!lib || lib.startsWith('.') || lib.startsWith('/')) continue

      /* scoped package */
      if (lib.startsWith('@')) {
        const parts = lib.split('/')
        if (parts.length < 2) continue
        if (FORBIDDEN_SCOPES.has(parts[0])) continue
        usedLibs.add(parts[0] + '/' + parts[1])
      }
      /* normal package */
      else {
        if (NODE_BUILTINS.has(lib)) continue
        usedLibs.add(lib.split('/')[0])
      }
    }
  }

  const missing = []

  for (const lib of usedLibs) {
    if (!pkg.dependencies[lib]) {
      pkg.dependencies[lib] = 'latest'
      missing.push(`${lib}@latest`)
    }
  }

  if (missing.length === 0) {
    return m.reply('✅ كل المكتبات المطلوبة من plugins مثبتة بالفعل')
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

  await conn.sendMessage(m.chat, {
    document: fs.readFileSync(pkgPath),
    mimetype: 'application/json',
    fileName: 'package.json',
    caption:
      '📦 تم العثور على مكتبات غير مثبتة وإضافتها:\n\n' +
      missing.join('\n') +
      '\n\n⬇️ حمّل الملف ثم شغّل:\n npm install'
  }, { quoted: m })
}
handler.help = ['npm-install']
handler.tags = ['owner']
handler.command = /^npm-install$/i
handler.owner = true

export default handler