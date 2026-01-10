import axios from "axios";

// دالة التحقق من الروابط
const facebookRegex = /(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.watch)\/[^\s]+/gi;

export async function before(m, { conn }) {
    if (!m.text || m.isBaileys || m.fromMe || /^[.>#!]/.test(m.text)) return true;

    let chat = global.db.data.chats[m.chat] || {};
    let user = global.db.data.users[m.sender] || {};

    // التحقق من المفاتيح المطلوبة للفيديو
    let isVidEnabled = (chat.autodownload && chat.fbv) || (user.autodownload && user.fbv) || chat.fbv || user.fbv;
    if (!isVidEnabled) return true;

    let matches = m.text.match(facebookRegex);
    if (!matches) return true;

    for (const url of matches) {
        try {
            await m.react('⏳');
            let result = await fesnuk(url);

            if (result.quality.sd) {
                await conn.sendMessage(m.chat, {
                    video: { url: result.quality.sd },
                    caption: `🎬 *Facebook Video*\n📌 *Title:* ${result.title}`,
                    mimetype: 'video/mp4',
                }, { quoted: m });
                await m.react('✅');
            }
        } catch (e) {
            console.error("FB Video Auto Error:", e);
            await m.react('❌');
        }
    }
    return true;
}

// --- محرك التحميل الخاص بك (نسخة طبق الأصل) ---
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

    return {
        title: parseString(title),
        quality: { sd: parseString(sdUrl || ""), hd: parseString(hdUrl || "") }
    };
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
