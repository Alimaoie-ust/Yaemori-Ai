import MessageType from '@adiwajshing/baileys'
import { generateWAMessageFromContent } from '@adiwajshing/baileys'

let handler = async (m, { conn, text, participants }) => {
  let users = participants.map(u => conn.decodeJid(u.id))

  // قائمة الرسائل القصيرة والمضحكة
  const randomMessages = [
    'أنا لست الفاعل 🤐',
    'هل تريد شرب القهوة؟ 😂',
    'من نحن؟ 😅',
    'هل تعرف أين تذهب؟ 🤔',
    'الحياة حلوة لو نعرف كيف نعيشها 😎',
    'في حال كان هناك خطأ، فهو ليس ذنبي! 🤷‍♂️',
    'كل شيء ممكن... ما عدا النوم 😴',
    'أنا مشغول جدًا، لكن ماشي الحال! 😜',
    'فقط أعيش وأتمنى لكم يومًا جيدًا 🤗',
    'هل شاهدت السماء اليوم؟ أو هل كانت السماء تُشاهدك؟ 🤔'
  ]
  
  // إذا تم الرد على رسالة، سيتم إرسال نفس الرسالة، وإذا لم يتم الرد سيتم إرسال رسالة عشوائية
  let messageToSend = (m.quoted && m.quoted.text) ? m.quoted.text : randomMessages[Math.floor(Math.random() * randomMessages.length)];

  // الحصول على الرسالة المُعدلة
  const msg = conn.cMod(
    m.chat,
    generateWAMessageFromContent(
      m.chat,
      {
        extendedTextMessage: {
          text: messageToSend,
        },
      },
      {
        quoted: m,
        userJid: conn.user.id,
      }
    ),
    messageToSend,  // استخدام الرسالة المختارة
    conn.user.jid,
    { mentions: users }
  )

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = ['hidetag', 'مخفي']
handler.group = true
handler.admin = true

export default handler