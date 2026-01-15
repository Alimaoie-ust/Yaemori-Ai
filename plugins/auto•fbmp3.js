import axios from "axios";
import { toAudio } from '../lib/converter.js'; // استدعاء دالة تحويل الفيديو لصوت

// Regex لاكتشاف روابط فيسبوك
const facebookRegex = /(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.watch)\/[^\s]+/gi;

export async function before(m, { conn }) {
    // 1. التحقق من الرسالة (فلتر)
    if (!m.text || m.isBaileys || m.fromMe || /^[.>#!]/.test(m.text)) return true;

    let chat = global.db.data.chats[m.chat] || {};
    let user = global.db.data.users[m.sender] || {};

    // 2. التحقق من المفاتيح: fb3 أو (autodownload + fb3)
    let isAudEnabled = (chat.autodownload && chat.fb3) || (user.autodownload && user.fb3) || chat.fb3 || user.fb3;
    if (!isAudEnabled) return true;

    // 3. التحقق من وجود رابط فيسبوك في النص
    let matches = m.text.match(facebookRegex);
    if (!matches) return true;

    for (const url of matches) {
        try {
            await m.react('⏳');
            
            // 4. تشغيل محرك الاستخراج (نفس الكود الذي أرسلته أنت)
            let result = await fesnuk(url);
            let videoUrl = result.quality.sd || result.quality.hd;

            if (videoUrl) {
                // 5. تحميل الفيديو كـ Buffer ثم تحويله لصوت
                const res = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                const videoBuffer = Buffer.from(res.data, 'binary');

                // تحويل الفيديو إلى Buffer صوتي (mp3)
                const audio = await toAudio(videoBuffer, 'mp4');

                // 6. إرسال الصوت النهائي للدردشة
                await conn.sendMessage(m.chat, {
                    audio: audio.data,
                    mimetype: 'audio/mpeg',
                    fileName: `${result.title || 'fb_audio'}.mp3`
                }, { quoted: m });
                
                await m.react('✅');
            }
        } catch (e) {
            console.error("FB Audio Auto Error:", e);
            await m.react('❌');
        }
    }
    return true;
}

// --- المحرك الموثوق (الذي يعمل معك يدوياً) ---
async function fesnuk(postUrl) {
    const headers = {
        "sec-fetch-user": "?1",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-site": "none",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "cache-control": "max-age=0",
        authority: "www.facebook.com",
        "upgrade-insecure-requests": "1",
        "accept-language": "en-GB,en;q=0.9",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    };

    const { data } = await axios.get(postUrl, { headers });
    const extractData = data.replace(/"/g, '"').replace(/&/g, "&");

    const sdUrl = match(extractData, /"browser_native_sd_url":"(.*?)"/, /sd_src\s*:\s*"([^"]*)"/)?.[1];
    const hdUrl = match(extractData, /"browser_native_hd_url":"(.*?)"/, /hd_src\s*:\s*"([^"]*)"/)?.[1];
    const title = match(extractData, /<meta\sname="description"\scontent="(.*?)"/)?.[1] || "";

    if (sdUrl) {
        return {
            title: parseString(title),
            quality: { sd: parseString(sdUrl), hd: parseString(hdUrl || "") }
        };
    }
    throw new Error("Media not found");
}

function parseString(string) {
    try { return JSON.parse(`{"text": "${string}"}`).text; } catch (e) { return string; }
}

function match(data, ...patterns) {
    for (const pattern of patterns) {
        const result = data.match(pattern);
        if (result) return result;
    }
    return null;
}
