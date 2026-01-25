let handler = async (m, { text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  let input = text.trim().toLowerCase()

  if (input === 'list') {
    user.menuMode = 'list'
    m.reply('✅ تم تفعيل وضع القائمة (LIST MENU)')
  } else if (input === 'gif' || input === 'normal') {
    user.menuMode = 'normal'
    m.reply('✅ تم تفعيل الوضع العادي (NORMAL MENU)')
  } else {
    // رسالة الخطأ في حال كتابة أمر غير صحيح
    m.reply(`⚠️ أمر غير صالح!\n\nاستخدم:\n📌 *${usedPrefix}${command} list* (لوضع القائمة)\n📌 *${usedPrefix}${command} gif* (لوضع الفيديو/الصوت)`)
  }
}

handler.help = ['templatemenu']
handler.arabic = ['تخصيص-القائمة <list/gif']
handler.tags = ['main']
handler.command = ['tempm','تخصيص','templatemenu'] 
handler.register = true
handler.admin = true
handler.botadmin = true

export default handler