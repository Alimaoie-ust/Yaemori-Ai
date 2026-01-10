// plugin by ALI Maoie 
// scrape by malik 
import axios from "axios"; 

// دالة الترجمة لضمان فهم الذكاء الاصطناعي للوصف بدقة
async function translateToEnglish(text) {
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" +
      encodeURIComponent(text);
    const response = await axios.get(url);
    return response.data[0].map(t => t[0]).join("");
  } catch (error) {
    console.error("Translation failed:", error.message);
    return text; 
  }
}

const API_KEY = "E64FUZgN4AGZ8yZr";
const BASE_URL = "https://getimg-x4mrsuupda-uc.a.run.app";
const IMAGE_API_ENDPOINT = `${BASE_URL}/api-premium`;

let handler = async (m, { conn, args, usedPrefix, command }) => {
    
    // 1. التحقق من الإدخال
    if (!args[0])
        return conn.reply(m.chat, `❗ يرجى كتابة وصف للصورة التي تريدها.\n\n*مثال:*\n${usedPrefix + command} رائد فضاء في غابة سحرية`, m, global.rcanal);

    let originalPrompt = args.join(" ");

    // 2. إرسال تفاعل وانتظار
    await conn.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });
    await conn.reply(m.chat, "⏳ جاري رسم صورتك... المرجو الانتظار قليلاً.", m, global.rcanal);

    try {
        // 3. الترجمة للإنجليزية لتحسين النتائج
        const prompt = await translateToEnglish(originalPrompt);

        // 4. إعداد طلب الـ API
        const requestBody = new URLSearchParams({
            prompt: prompt,
            width: 512,
            height: 512,
            num_inference_steps: 20
        }).toString();
        
        const config = {
            method: "POST",
            url: IMAGE_API_ENDPOINT,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Dzine-Media-API": API_KEY,
            },
            data: requestBody
        };

        // 5. تنفيذ الطلب
        const res = await axios(config);
        const data = res.data;

        // 6. التحقق من النتيجة
        if (res.status !== 200 || !data?.url) {
            throw new Error("فشل الخادم في توليد الصورة.");
        }

        // 7. إرسال الصورة النهائية مع القناة
        await conn.sendMessage(m.chat, {
            image: { url: data.url },
            caption: `✅ تم توليد صورتك بنجاح!\n\n*الوصف:* ${originalPrompt}`,
            contextInfo: global.rcanal.contextInfo 
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✨", key: m.key } });

    } catch (e) {
        console.error("Image Generation Error:", e);
        return conn.reply(m.chat, `❌ حدث خطأ غير متوقع: ${e.message}`, m, global.rcanal);
    }
};

handler.help = handler.command = ['gen'];
handler.tags = ['ai'];
handler.limit = true;

export default handler;
