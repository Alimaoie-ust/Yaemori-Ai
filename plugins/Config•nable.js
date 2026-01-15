let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false
  
  // دالة لجلب الرمز (صح أو خطأ)
  const status = (cond) => cond ? '✅' : '❌'

  switch (type) {
    case 'welcome':
    case 'ترحيب':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
      chat.welcome = isEnable
      break

    case 'antiprivate':
    case 'خاص':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.antiPrivate = isEnable
      break

    case 'restrict':
    case 'تقييد':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.restrict = isEnable
      break

    case 'antibot':
    case 'انتي-بوت':
      if (m.isGroup && !(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false }
      chat.antiBot = isEnable
      break

    case 'antifake':
    case 'وهمي':
      if (m.isGroup && !(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false }
      chat.onlyLatinos = isEnable
      break

    case 'adminmode':
    case 'وضع-الادمن':
      if (m.isGroup && !(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false }
      chat.modoadmin = isEnable
      break

    case 'autoread':
    case 'قراءة-تلقائية':
      isAll = true
      if (!isROwner) { global.dfail('rowner', m, conn); throw false }
      global.opts['autoread'] = isEnable
      break

    case 'antiviewonce':
    case 'ضد-المشاهدة':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
      chat.antiver = isEnable
      break

    case 'reaction':
    case 'تفاعل':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
      chat.reaction = isEnable
      break

    case 'audios':
    case 'صوتيات':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
      chat.audios = isEnable
      break

    case 'antispam':
    case 'سبام':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.antiSpam = isEnable
      break

    case 'antidelete':
    case 'حذف':
      if (m.isGroup && !(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false }
      chat.delete = isEnable
      break

    case 'autobio':
    case 'بيو':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.autobio = isEnable
      break

    case 'detect':
    case 'كاشف':
      if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
      chat.detect = isEnable
      break

    case 'antilink':
    case 'روابط':
      if (m.isGroup && !(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false }
      chat.antiLink = isEnable
      break

    case 'nsfw':
    case 'منحرف':
      if (m.isGroup && !(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false }
      chat.modohorny = isEnable
      break

    default:
      if (!/[01]/.test(command)) return conn.reply(m.chat, `
*👑 خيارات المطور*
${status(bot.antiSpam)} ${usedPrefix + command} antispam
${status(bot.antiPrivate)} ${usedPrefix + command} antiprivate
${status(bot.autobio)} ${usedPrefix + command} autobio
${status(bot.restrict)} ${usedPrefix + command} restrict
${status(global.opts['autoread'])} ${usedPrefix + command} autoread

*🚩 خيارات المجموعات*
${status(chat.welcome)} ${usedPrefix + command} welcome
${status(chat.antiBot)} ${usedPrefix + command} antibot
${status(chat.reaction)} ${usedPrefix + command} reaction
${status(chat.antiver)} ${usedPrefix + command} antiviewonce
${status(chat.detect)} ${usedPrefix + command} detect
${status(chat.delete)} ${usedPrefix + command} antidelete
${status(chat.antiLink)} ${usedPrefix + command} antilink
${status(chat.modoadmin)} ${usedPrefix + command} adminmode
${status(chat.modohorny)} ${usedPrefix + command} nsfw
${status(chat.audios)} ${usedPrefix + command} audios
`, m)
      throw false
  }
  
  conn.reply(m.chat, `✅ تم ${isEnable ? 'تفعيل' : 'إيقاف'} ميزة *${type}* بنجاح ${isAll ? 'للبوت بالكامل' : isUser ? 'لك' : 'لهذا الشات'}.`, m)
}

handler.help = ['on', 'off']
handler.tags = ['config', 'owner']
handler.command = ['enable', 'disable', 'on', 'off', '1', '0']

export default handler
