import axios from 'axios';
import crypto from 'crypto';

const youtubeRegex = /(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/|v\/|.+\?v=)?([^"&?\/\s]{11})/gi;

export async function before(m, { conn }) {
    if (!m.text || m.isBaileys || m.fromMe || /^[.>#!]/.test(m.text)) return true;

    let chat = global.db.data.chats[m.chat] || {};
    let user = global.db.data.users[m.sender] || {};

    // شرط التشغيل: (شامل + وضع الصوت) أو (وضع الصوت منفرد)
    let isMp3Enabled = (chat.autodownload && chat.mp3dl) || (user.autodownload && user.mp3dl) || chat.mp3dl || user.mp3dl;

    if (!isMp3Enabled) return true;

    let matches = m.text.match(youtubeRegex);
    if (!matches) return true;

    for (const url of matches) {
        try {
            await m.react('⏳');
            let res = await savetube.download(url, 'mp3');
            
            if (!res.status) continue; 

            await conn.sendMessage(m.chat, { 
                audio: { url: res.result.download }, 
                mimetype: 'audio/mpeg', 
                fileName: `${res.result.title}.mp3` 
            }, { quoted: m });
            
            await m.react('✅');
        } catch (e) {
            await m.react('❌');
        }
    }
    return true;
}

// --- المحرك المعتمد ---
const savetube = {
  api: { base: "https://media.savetube.me/api", cdn: "/random-cdn", info: "/v2/info", download: "/download" },
  headers: { 'accept': '*/*', 'content-type': 'application/json', 'origin': 'https://yt.savetube.me', 'referer': 'https://yt.savetube.me/', 'user-agent': 'Postify/1.0.0' },
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
      const res = await axios({ method, url: `${end.startsWith('http') ? '' : savetube.api.base}${end}`, data, headers: savetube.headers });
      return { status: true, data: res.data };
    } catch (e) { return { status: false }; }
  },
  download: async (link, format) => {
    const id = savetube.youtube(link);
    if (!id) return { status: false };
    try {
      const cdnx = await savetube.request(savetube.api.cdn, {}, 'get');
      const cdn = cdnx.data.cdn;
      const result = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` });
      const decrypted = await savetube.crypto.decrypt(result.data.data);
      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id: id, downloadType: 'audio', quality: '128', key: decrypted.key
      });
      return { status: true, result: { title: decrypted.title, download: dl.data.data.downloadUrl } };
    } catch (e) { return { status: false }; }
  }
};
