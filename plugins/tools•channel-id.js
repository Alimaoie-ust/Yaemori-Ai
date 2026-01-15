import { generateWAMessageFromContent } from '@adiwajshing/baileys';

let handler = async (m, { text, conn }) => {
  if (!text) return global.dfail('private', m, conn);
  if (!text.includes('https://whatsapp.com/channel/')) return global.dfail('admin', m, conn);
  
  let result = text.split('https://whatsapp.com/channel/')[1];
  let res = await conn.newsletterMetadata('invite', result);
  
  let teks = `*ID:* ${res.id}\n*Name:* ${res.name}\n*Total Subscribers:* ${res.subscribers}\n*Status:* ${res.state}\n*Verified:* ${res.verification === 'VERIFIED' ? 'Verified' : 'Not Verified'}`;

  // استبدال m.reply(teks) باستخدام rcanal
  await conn.reply(m.chat, teks, m, rcanal);
};

handler.help = ['channel-id'];
handler.arabic = ['ايدي-القناة'];
handler.command = ['channel-id','ايدي-القناة'];
handler.tags = ['tools'];
handler.limit = true;

export default handler;