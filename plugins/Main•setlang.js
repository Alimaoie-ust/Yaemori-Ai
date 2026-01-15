let handler = async (m, { conn, args }) => {
    let type = (args[0] || '').toLowerCase()
    if (!['ar', 'en'].includes(type)) return m.reply('*Example:* .setlang ar')

    if (m.isGroup) {
        // إذا كان في مجموعة، يغير لغة المجموعة (Chat)
        global.db.data.chats[m.chat].langmenu = type
        m.reply(`✅ ${type === 'ar' ? 'تم تحويل لغة المجموعة للعربية' : 'Group language set to English'}`)
    } else {
        // إذا كان في الخاص، يغير لغة المستخدم (User)
        global.db.data.users[m.sender].langmenu = type
        m.reply(`✅ ${type === 'ar' ? 'تم تحويل لغتك الخاصة للعربية' : 'Your private language set to English'}`)
    }
}
handler.help = ['setlang <ar/en']
handler.arabic = ['اللغة']
handler.tags = ['main']
handler.command = ['setlang','اللغة']
handler.admin = true;
export default handler