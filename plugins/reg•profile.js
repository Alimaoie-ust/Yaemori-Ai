import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

var handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.fromMe
      ? conn.user.jid
      : m.sender

  let pp = await conn.profilePictureUrl(who, 'image')
    .catch(_ => imagen1)

  let {
    premium,
    level,
    cookies,
    exp,
    lastclaim,
    registered,
    regTime,
    age,
    role
  } = global.db.data.users[m.sender]

  let username = conn.getName(who)

  // ─────── المستخدم العادي ───────
  let noprem = `
┏━━━━━━━━━━━⪩
┃ ❖ *مــلــف الــمــســتــخــدم*
┃━━━━━━━━━━━
┃ 👤 *الاسم:* ${username}
┃ 🆔 *المعرّف:* @${who.replace(/@.+/, '')}
┃ 📋 *مسجّل:* ${registered ? '✔️' : '❌'}
┗━━━━━━━━━━━⪩

┏━━━━━━━━━━━⪩
┃ ⚙️ *الــمــوارِد*
┃━━━━━━━━━━━
┃ 🍪 *الكوكيز:* ${cookies}
┃ 🔰 *المستوى:* ${level}
┃ ✨ *الخبرة:* ${exp}
┃ 🏷️ *الرتبة:* ${role}
┃ 💎 *بريميوم:* ${premium ? '✔️' : '❌'}
┗━━━━━━━━━━━⪩
`.trim()

  // ─────── المستخدم البريميوم ───────
  let prem = `
╭───⪩ 👑 *مــســتــخــدم بــريــمــيــوم* ⪨
│
│ 👤 *الاسم:* 「${username}」
│ 📋 *مسجّل:* ${registered ? '✔️' : '❌'}
│ 🔱 *الرتبة:* Vip 👑
│
╰────────────⪨

╭────⪩ ⚙️ *الــمــوارِد* ⪨
│ 🍪 *الكوكيز:* ${cookies}
│ 🔰 *المستوى:* ${level}
│ ✨ *الخبرة:* ${exp}
│ ⚜️ *التصنيف:* ${role}
╰────────────⪨

🌟 *مستخدم مميّز — وصول كامل للميزات* 🌟
`.trim()

  // ─────── الإرسال ───────
  await conn.sendFile(
    m.chat,
    pp,
    'profile.jpg',
    premium ? prem : noprem,
    m,
    rcanal,
    { mentions: [who] }
  )
}

handler.help = ['profile']
handler.tags = ['register']
handler.command = ['profile']
handler.register = true

export default handler