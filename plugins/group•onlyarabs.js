let handler = async (m, { conn, args, usedPrefix, command }) => {
    let isEnable = /true|enable|on/i.test(args[0])
    let chat = global.db.data.chats[m.chat]
    
    // التحقق من وجود قيمة في المدخلات
    if (!args[0]) return conn.reply(m.chat, `❗ يرجى تحديد الحالة:\n*${usedPrefix + command} on* للتفعيل\n*${usedPrefix + command} off* للتعطيل`, m, global.rcanal)

    if (isEnable) {
        chat.onlyArabs = true
        conn.reply(m.chat, '✅ *تم تفعيل خاصية "العرب فقط".*\n\nسيقوم البوت الآن بمراقبة المجموعة وطرد أي رقم غير عربي (+212, +966, +20...) تلقائياً.', m, global.rcanal)
    } else {
        chat.onlyArabs = false
        conn.reply(m.chat, '❌ *تم إلغاء تفعيل خاصية "العرب فقط".*\n\nأصبح بإمكان الأرقام الأجنبية البقاء في المجموعة الآن.', m, global.rcanal)
    }
}

handler.help = ['onlyarabs <on/off>']
handler.arabic = ['عرب-فقط <on/off>']
handler.tags = ['group']
handler.command = ['onlyarabs','عرب-فقط']
handler.admin = true // للمشرفين فقط
handler.group = true // للمجموعات فقط

export default handler
