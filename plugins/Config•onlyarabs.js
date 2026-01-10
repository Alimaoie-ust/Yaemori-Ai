let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {

    if (!m.isGroup) return !1
    let chat = global.db.data.chats[m.chat]

    if (chat.onlyArabs && isBotAdmin && !isAdmin && !isOwner) {
  
        const arabPrefixes = [
            '212', // المغرب
            '966', // السعودية
            '971', // الإمارات
            '965', // الكويت
            '968', // عمان
            '974', // قطر
            '973', // البحرين
            '962', // الأردن
            '961', // لبنان
            '963', // سوريا
            '964', // العراق
            '970', // فلسطين
            '20',  // مصر
            '213', // الجزائر
            '216', // تونس
            '218', // ليبيا
            '249', // السودان
            '967', // اليمن
            '222', // موريتانيا
            '252', // الصومال
            '253', // جيبوتي
            '269'  // جزر القمر
        ]

        // التحقق: هل يبدأ رقم العضو بأي مفتاح عربي؟
        let isArab = arabPrefixes.some(prefix => m.sender.startsWith(prefix))

        if (!isArab) {
            await m.reply('🚩 *عذراً، هذا القروب مخصص للعرب فقط (Only Arabs).*\n\nYour number is not allowed here.')
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            return false 
        }
    }

    return true
}

export default handler
