let handler = async (m, { conn, usedPrefix, text, isAdmin }) => {
  // تأكد من أن المستخدم إداري
  if (!isAdmin) {
    return conn.reply(m.chat, `*[❗] هذا الأمر متاح فقط للإداريين!*`, m);
  }

  if (isNaN(text) && !text.match(/@/g)) {
    // لا شيء هنا
  } else if (isNaN(text)) {
    var number = text.split`@`[1];
  } else if (!isNaN(text)) {
    var number = text;
  }

  if (!text && !m.quoted) {
    return conn.reply(m.chat, `*[❗] الاستخدام المناسب*\n\n*┯┷*\n*┠≽ ${usedPrefix}ترقيه مشرف  @منشن*\n*┠≽ ${usedPrefix}ترقيه مشرف  -> الرد على رسالة*\n*┷┯*`, m);
  }
  
  if (number.length > 13 || (number.length < 11 && number.length > 0)) {
    return conn.reply(m.chat, `*[ ⚠️ ] الرقم الذي تم إدخاله غير صحيح ، الرجاء إدخال الرقم الصحيح*`, m);
  }

  try {
    let user;
    if (text) {
      user = number + '@s.whatsapp.net';
    } else if (m.quoted.sender) {
      user = m.quoted.sender;
    } else if (m.mentionedJid) {
      user = number + '@s.whatsapp.net';
    }
    
    if (user) {
      await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
      conn.reply(m.chat, `*[✔️] تم ترقية @${user.split('@')[0]} إلى مشرف.*`, m);
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `*[❗] حدث خطأ أثناء الترقيه.*`, m);
  }
};

handler.help = ['upadmin'];
handler.arabic = ['رقي','ترقية']
handler.tags = ['group'];
handler.command = ['upadmin','ترقيه','رقي'];
handler.group = true;
handler.rowner = true; // التأكد أن الأمر خاص بالمالك
handler.botAdmin = true; // التأكد أن البوت إداري
handler.fail = null;

export default handler;