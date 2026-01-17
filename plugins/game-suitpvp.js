let timeout = 60000;
let poin = 50000;
let poin_lose = -2000;

let handler = async (m, { conn, usedPrefix, command }) => {
  conn.suit = conn.suit ? conn.suit : {};
  
  if (
    Object.values(conn.suit).find(
      (room) =>
        room.id.startsWith("suit") && [room.p, room.p2].includes(m.sender),
    )
  )
    throw "⚠️ قم بإنهاء تحدي 'حجر ورقة مقص' الحالي أولاً!";

  if (!m.mentionedJid[0])
    return m.reply(
      `_من تريد أن تتحدى؟_\nقم بالإشارة للشخص.. مثال:\n\n${usedPrefix + command} @المستخدم`,
    );

  if (
    Object.values(conn.suit).find(
      (room) =>
        room.id.startsWith("suit") &&
        [room.p, room.p2].includes(m.mentionedJid[0]),
    )
  )
    throw `👤 الشخص الذي تحاول تحديه يلعب حالياً مع شخص آخر :(`;

  let id = "suit_" + new Date() * 1;
  let caption = `
*[ تـحـدي حـجـر ورقة مـقـص ]*

المستخدم @${m.sender.split`@`[0]} يتحدى @${m.mentionedJid[0].split`@`[0]} في مباراة!
`.trim();

  let footer = `\n\nاكتب "موافق" أو "نعم" للبدء\nاكتب "رفض" أو "لا" للإلغاء`;
  
  conn.suit[id] = {
    chat: await conn.reply(m.chat, caption + footer, m, {
      contextInfo: { mentionedJid: conn.parseMention(caption) },
    }),
    id: id,
    p: m.sender,
    p2: m.mentionedJid[0],
    status: "wait",
    waktu: setTimeout(() => {
      if (conn.suit[id]) conn.reply(m.chat, `⌛ انتهى وقت قبول التحدي.`, m);
      delete conn.suit[id];
    }, timeout),
    poin,
    poin_lose,
    timeout,
  };
};

handler.help = ["suitpvp @user"];
handler.tags = ["game"];
handler.command = ["suitpvp", "تحدي", "حجر_ورقة"];
handler.arabic = ["تحدي <@منشن>"];
handler.group = true;

export default handler;
