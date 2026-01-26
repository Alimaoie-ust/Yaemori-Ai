let handler = async (m, { conn, text, command, usedPrefix }) => {
  // 1. تحديد اللغة بناءً على المكان (مجموعة أو خاص)
  let chat = global.db.data.chats[m.chat] || {}
  let user = global.db.data.users[m.sender] || {}
  let lang = m.isGroup ? (chat.langmenu || 'ar') : (user.langmenu || 'ar')

  // 2. تعريف النصوص المترجمة
  const strings = {
    ar: {
      bioTitle: "📝 *الوصف الشخصي (Bio):*",
      noBio: "لا توجد حالة مكتوبة",
      private: "⚠️ *عذراً!* هذا المستخدم قام بجعل الوصف الشخصي خاصاً أو لا يوجد لديه وصف."
    },
    en: {
      bioTitle: "📝 *About (Bio):*",
      noBio: "No bio found",
      private: "⚠️ *Sorry!* This user's bio is private or they don't have one."
    }
  }

  const s = strings[lang] || strings['ar'] // الافتراضي عربي

  try {
    let who;
    if (m.isGroup) {
      who = m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender));
    } else {
      who = m.quoted ? m.quoted.sender : (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.sender);
    }

    let bio = await conn.fetchStatus(who);
    let status = bio.status || s.noBio;
    
    await conn.reply(m.chat, `${s.bioTitle}\n\n${status}`, m, global.rcanal);

  } catch (e) {
    conn.reply(m.chat, s.private, m, global.rcanal);
  }
};

handler.help = ["getbio", "bio"];
handler.arabic = ['بايو', 'الحالة'];
handler.tags = ["tools"];
handler.command = /^(getbio|bio|بايو|الحالة)$/i;
handler.limit = true;

export default handler;
