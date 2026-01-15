let handler = async (m, { conn, args, isOwner }) => {
if (!isOwner) return global.dfail('owner', m, conn)

let opt = (args[0] || '').toLowerCase()
let settings = global.db.data.settings[conn.user.jid]

if (opt === 'voice') {
settings.Dfailvoice = true
settings.Dfailtext = false
return m.reply('✅ تم تفعيل رسائل الأخطاء الصوتية')
}

if (opt === 'txt' || opt === 'text') {
settings.Dfailvoice = false
settings.Dfailtext = true
return m.reply('✅ تم تفعيل رسائل الأخطاء النصية')
}

m.reply(`❌ استخدم:
.templatefail voice  → أخطاء صوتية
.templatefail txt    → أخطاء نصية`)
}

handler.help = ['templatefail']
handler.arabic = ['تيمبلات <voice/txt>']
handler.command = ['templatefail','تيمبلات']
handler.owner = true
export default handler