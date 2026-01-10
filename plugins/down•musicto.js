import axios from 'axios';
import crypto from 'crypto';
import yts from 'yt-search';

// --- محرك Savetube المضمون ---
const savetube = {
  api: { base: "https://media.savetube.me/api", cdn: "/random-cdn", info: "/v2/info", download: "/download" },
  headers: { 'accept': '*/*', 'content-type': 'application/json', 'origin': 'https://yt.savetube.me', 'user-agent': 'Postify/1.0.0' },
  crypto: {
    hexToBuffer: (hex) => Buffer.from(hex.match(/.{1,2}/g).join(''), 'hex'),
    decrypt: async (enc) => {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
      const data = Buffer.from(enc, 'base64'), iv = data.slice(0, 16), content = data.slice(16);
      const key = savetube.crypto.hexToBuffer(secretKey);
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let dec = Buffer.concat([decipher.update(content), decipher.final()]);
      return JSON.parse(dec.toString());
    }
  },
  request: async (end, data = {}, method = 'post') => {
    const res = await axios({ method, url: `${end.startsWith('http') ? '' : savetube.api.base}${end}`, data, headers: savetube.headers });
    return { status: true, data: res.data };
  },
  download: async (id) => {
    try {
      const cdnRes = await savetube.request(savetube.api.cdn, {}, 'get');
      const cdn = cdnRes.data.cdn;
      const info = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` });
      const dec = await savetube.crypto.decrypt(info.data.data);
      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, { id, downloadType: 'audio', quality: '128', key: dec.key });
      return { status: true, url: dl.data.data.downloadUrl, title: dec.title };
    } catch (e) { return { status: false }; }
  }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) return m.reply(`⚠️ ${usedPrefix + command} 212xxx | رابط البلايليست`);

    let [num, url] = text.split('|').map(v => v.trim());
    let jid = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    try {
        await m.react('⏳');
        const listId = url.match(/[?&]list=([^#\&\?]+)/)?.[1];
        if (!listId) return m.reply("❌ رابط بلايليست غير صحيح.");

        const playlist = await yts({ listId: listId });
        if (!playlist || !playlist.videos) return m.reply("❌ لم يتم العثور على فيديوهات.");

        // جلب بيانات المرسل (أنت) لتضمينها في الرسالة
        let senderName = m.pushName || 'شخص ما';
        let senderId = m.sender.split('@')[0];

        // --- الرسالة المعدلة مع المنشن التلقائي ---
        const intro = `مرحباً، أنا *Yaemori* 🤖\nلقد صنع لك *${senderName}* (@${senderId}) هذه البلايليست وأرسلها لك خصيصاً.\nجاري إرسال الأغاني الآن... 🎵`;
        
        // إرسال الرسالة للمستلم مع تفعيل المنشن
        await conn.sendMessage(jid, { 
            text: intro, 
            mentions: [m.sender] 
        });

        let success = 0;
        const videos = playlist.videos.slice(0, 15); 

        for (const vid of videos) {
            let res = await savetube.download(vid.videoId);
            if (res.status) {
                await conn.sendMessage(jid, { 
                    audio: { url: res.url }, 
                    mimetype: 'audio/mpeg', 
                    fileName: `${res.title}.mp3` 
                });
                success++;
            }
        }

        m.reply(`✅ تم إرسال *${success}* أغنية بنجاح إلى الرقم المطلوب.`);
        await m.react('✅');

    } catch (e) {
        m.reply("❌ حدث خطأ غير متوقع.");
    }
};

handler.help = ['musicto'];
handler.command = ['musicto'];
handler.tags = ['downloader'];
handler.owner = true;
handler.rowner = true;

export default handler;