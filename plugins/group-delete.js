let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. تحديد اللغة بناءً على إعدادات المجموعة أو المستخدم
    let chat = global.db.data.chats[m.chat] || {}
    let user = global.db.data.users[m.sender] || {}
    let lang = m.isGroup ? (chat.langmenu || 'ar') : (user.langmenu || 'ar')

    // 2. تعريف النصوص المترجمة
    const strings = {
        ar: {
            example: `🚩 *تنبيه:* يرجى الرد على الرسالة التي تريد حذفها.`,
        },
        en: {
            example: `🚩 *Notice:* Please reply to the message you want to delete.`,
        }
    }

    const s = strings[lang] || strings['ar']

    // التحقق من وجود رد على رسالة
    if (!m.quoted) return conn.reply(m.chat, s.example, m, global.rcanal)

    try {
        // المنطق البرمجي الذي يعمل لديك
        let delet = m.message.extendedTextMessage.contextInfo.participant
        let bang = m.message.extendedTextMessage.contextInfo.stanzaId
        return conn.sendMessage(m.chat, { 
            delete: { 
                remoteJid: m.chat, 
                fromMe: false, 
                id: bang, 
                participant: delet 
            }
        })
    } catch {
        // الطريقة الاحتياطية في حال فشل الأولى
        return conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
    }
}

handler.help = ['delete']
handler.arabic = ['حذف', 'مسح']
handler.tags = ['group']
handler.command = ['del', 'delete', 'حذف', 'مسح']
handler.admin = true
handler.botAdmin = true

export default handler
