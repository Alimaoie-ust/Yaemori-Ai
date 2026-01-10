// plug by ALI M & GPT😂

import yts from 'yt-search'
import fs from 'fs'

let handler = async (m, { conn, text }) => {
    if (!text)
        return m.reply("هذا الأمر خاص بالبحث في اليوتيوب.\n\nمثال:\n*.yts ali maoi whatsapp bot*");

    await conn.reply(m.chat, global.wait, m);

    // البحث في اليوتيوب
    let results = await yts(text);
    let videos = results.videos.slice(0, 15); // نأخذ أفضل 15 فيديو فقط

    if (!videos.length) return m.reply("❌ لم يتم العثور على نتائج!");

    // بناء rows للقائمة المنبثقة
    let rows = [];

    for (let v of videos) {
        rows.push({
            header: "🎬 فيديو",
            title: v.title,
            description: `⏱ ${v.timestamp} | 👁 ${v.views}`,
            id: `.play ${v.url}` // ← عند الضغط ينفذ أمر play تلقائياً
        });
    }

    // بناء القائمة بنفس قالب template.js
    const datas = {
        title: "🔎 نتائج البحث في YouTube",
        sections: [
            {
                title: "اختر فيديو لتحميله",
                highlight_label: "YouTube",
                rows: rows
            }
        ]
    };

    // الصورة المصغرة للفيديو الأول
    const thumb = videos[0].thumbnail;

    // إرسال القائمة
    return conn.sendListImageButton(
        m.chat,
        `🔍 نتائج البحث عن:\n*${text}*`,
        datas,
        "اضغط على الفيديو الذي تريد تحميله عبر .play",
        thumb
    );
};

handler.help = ["yts"];
handler.tags = ["search"];
handler.command = ["yts", "ytsearch"];
handler.limit = 1;

export default handler;