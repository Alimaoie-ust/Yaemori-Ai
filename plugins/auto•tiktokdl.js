import axios from 'axios'

// 1. تعريف الـ Regex الخاص بروابط تيك توك
const tiktokRegex = /(https?:\/\/)?(www\.|v[tm]\.)?tiktok\.com\/[\S]+/gi;

export async function before(m, { conn }) {
    // التحقق من وجود نص ومنع البوت من الرد على نفسه أو الأوامر المباشرة
    if (!m.text || m.isBaileys || m.fromMe) return true;
    if (/^[.>#!]/.test(m.text)) return true;

    // جلب إعدادات المجموعة والمستخدم من قاعدة البيانات
    let chat = global.db.data.chats[m.chat] || {};
    let user = global.db.data.users[m.sender] || {};

    // 2. التحقق من التفعيل (المنطق المطلوب)
    // سيعمل الكود إذا كان (autodownload مفعل) أو (tikdl مفعل)
    let isAutoDl = chat.autodownload || user.autodownload;
    let isTikDl = chat.tikdl || user.tikdl;

    if (!isAutoDl && !isTikDl) return true;

    // 3. البحث عن روابط تيك توك في النص
    let matches = m.text.match(tiktokRegex);
    if (!matches) return true;

    for (const url of matches) {
        try {
            // إرسال تفاعل "جاري التحميل" ورسالة انتظار
            await m.react('⏳');
            await this.reply(m.chat, '⏳ *جاري تحميل فيديو TikTok...*', m);

            const encodedParams = new URLSearchParams();
            encodedParams.set("url", url);
            encodedParams.set("hd", "1");

            const response = await axios({
                method: "POST",
                url: "https://tikwm.com/api/",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Cookie": "current_language=en",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
                },
                data: encodedParams,
            });

            let res = response.data.data;
            
            if (res && res.play) {
                // إرسال الفيديو مع العنوان
                await conn.sendFile(m.chat, res.play, 'tiktok.mp4', `🎬 ${res.title || 'لا يوجد عنوان'}`, m);
                await m.react('✅');
            } else {
                throw new Error("No media found");
            }

        } catch (e) {
            console.error("Auto TikTok Error:", e);
            await m.react('❌');
        }
    }
    return true;
}
