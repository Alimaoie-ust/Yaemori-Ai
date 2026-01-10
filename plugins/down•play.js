import axios from 'axios';

let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply('🚫 من فضلك أرسل اسم الأغنية بعد الأمر.\nمثال:\n*.play hello*');
  }

  try {
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    // 🔵 رسالة التحميل المتحركة المزخرفة
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    const frames = [
      "Ｌ",
      "Ｌｏ",
      "Ｌｏａ",
      "Ｌｏａｄ",
      "Ｌｏａｄｉ",
      "Ｌｏａｄｉｎ",
      "Ｌｏａｄｉｎｇ",
      "Ｌｏａｄｉｎｇ．",
      "Ｌｏａｄｉｎｇ．．",
      "Ｌｏａｄｉｎｇ．．．"
    ];

    let loadingMsg = await conn.sendMessage(m.chat, { text: frames[0] }, { quoted: m });

    for (let i = 1; i < frames.length; i++) {
      await new Promise(res => setTimeout(res, 400));
      await conn.sendMessage(
        m.chat,
        { text: frames[i], edit: loadingMsg.key },
      );
    }

    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    // 🔍 جلب معلومات الأغنية من API
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    const res = await axios.get(`https://pursky.vercel.app/api/ytplay?q=${encodeURIComponent(text)}`);
    const audio = res.data?.audio;

    if (!audio) {
      return conn.sendMessage(m.chat, { text: "❌ لم أستطع الحصول على الصوت." }, { edit: loadingMsg.key });
    }

    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    // 📥 تحميل ملف الصوت
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    const headers = res.data.note?.headers || {};
    const audioRes = await axios.get(audio, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": headers["User-Agent"] || "Mozilla/5.0 (Linux; Android 10)",
        "Referer": headers["Referer"] || audio
      }
    });

    let filename = text.replace(/\s+/g, "_") + ".mp3";

    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    // 🎵 إرسال mp3 كـ Audio طبيعي (ليس voice note)
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    await conn.sendMessage(
      m.chat,
      {
        audio: Buffer.from(audioRes.data),
        mimetype: "audio/mpeg",
        fileName: filename,
        ptt: false
      },
      { quoted: m }
    );

    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    // ✔️ تعديل رسالة التحميل إلى رسالة النهاية
    // ـــــــــــــــــــــــــــــــــــــــــــــــــــــ
    await conn.sendMessage(
      m.chat,
      {
        text: "✔️ تــمــ تـــحــمــيــلــ الــأغــنــيــة بــنــجــاح 🎶",
        edit: loadingMsg.key
      }
    );

  } catch (err) {
    console.error(err);
    return m.reply("⚠️ حدث خطأ أثناء تحميل الصوت.");
  }
};

handler.help = ['play'];
handler.command = ['play'];
handler.tags = ['downloader'];
handler.limit = false;
handler.register = false;

export default handler;