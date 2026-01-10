import axios from 'axios';
import crypto from 'crypto';

const youtubeRegex = /(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/|v\/|.+\?v=)?([^"&?\/\s]{11})/gi;

export async function before(m, { conn }) {
    if (!m.text || m.isBaileys || m.fromMe || /^[.>#!]/.test(m.text)) return true;

    let chat = global.db.data.chats[m.chat] || {};
    let user = global.db.data.users[m.sender] || {};

    // شرط التشغيل: (شامل + وضع فيديو) أو (وضع فيديو منفرد)
    let isVidEnabled = (chat.autodownload && chat.ytdl) || (user.autodownload && user.ytdl) || chat.ytdl || user.ytdl;

    if (!isVidEnabled) return true;

    let matches = m.text.match(youtubeRegex);
    if (!matches) return true;

    for (const url of matches) {
        try {
            await m.react('⏳');
            // محاولة جلب الفيديو بجودة 720، وإذا فشل يحاول بجودة أصلية
            let res = await savetube.download(url, 'video');
            
            if (!res.status || !res.result.download) {
                await m.react('❌');
                continue; 
            }

            await conn.sendMessage(m.chat, { 
                video: { url: res.result.download },
                caption: `✅ *تم التحميل:* ${res.result.title}`
            }, { quoted: m });
            
            await m.react('✅');
        } catch (e) {
            console.error("Video Download Error:", e);
            await m.react('❌');
        }
    }
    return true;
}

const savetube = {
  api: { base: "https://media.savetube.me/api", cdn: "/random-cdn", info: "/v2/info", download: "/download" },
  headers: { 
    'accept': '*/*', 
    'content-type': 'application/json', 
    'origin': 'https://yt.savetube.me', 
    'referer': 'https://yt.savetube.me/', 
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
  },
  crypto: {
    hexToBuffer: (hex) => Buffer.from(hex.match(/.{1,2}/g).join(''), 'hex'),
    decrypt: async (enc) => {
        const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
        const data = Buffer.from(enc, 'base64'), iv = data.slice(0, 16), content = data.slice(16);
        const key = savetube.crypto.hexToBuffer(secretKey);
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
        return JSON.parse(decrypted.toString());
    }
  },
  youtube: url => url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1],
  request: async (end, data = {}, method = 'post') => {
    try {
      const res = await axios({ 
        method, 
        url: `${end.startsWith('http') ? '' : savetube.api.base}${end}`, 
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers 
      });
      return { status: true, data: res.data };
    } catch (e) { return { status: false }; }
  },
  download: async (link) => {
    const id = savetube.youtube(link);
    if (!id) return { status: false };
    try {
      const cdnx = await savetube.request(savetube.api.cdn, {}, 'get');
      const cdn = cdnx.data.cdn;
      
      // جلب المعلومات
      const result = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` });
      const decrypted = await savetube.crypto.decrypt(result.data.data);
      
      // محاولة طلب الفيديو (نبدأ بـ 720 ثم ننزل لـ 360 إذا لم يتوفر)
      let dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id: id, downloadType: 'video', quality: '720', key: decrypted.key
      });
      
      if (!dl.data?.data?.downloadUrl) {
         dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
            id: id, downloadType: 'video', quality: '360', key: decrypted.key
         });
      }

      return { 
        status: !!dl.data?.data?.downloadUrl, 
        result: { title: decrypted.title, download: dl.data?.data?.downloadUrl } 
      };
    } catch (e) { return { status: false }; }
  }
};
