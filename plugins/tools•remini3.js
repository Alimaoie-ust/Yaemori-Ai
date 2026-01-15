import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const availableScaleRatio = [2, 4];

const imgupscale = {
  req: async (imagePath, scaleRatio) => {
    const form = new FormData();
    form.append("myfile", fs.createReadStream(imagePath));
    form.append("scaleRadio", scaleRatio.toString());
    const response = await axios.post("https://get1.imglarger.com/api/UpscalerNew/UploadNew", form, {
      headers: { ...form.getHeaders(), "origin": "https://imgupscaler.com" },
    });
    return response.data;
  },

  cek: async (code, scaleRatio) => {
    const response = await axios.post("https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew", { code, scaleRadio: scaleRatio }, {
      headers: { "Content-Type": "application/json", "origin": "https://imgupscaler.com" },
    });
    return response.data;
  },

  upscale: async (imagePath, scaleRatio) => {
    const uploadResult = await imgupscale.req(imagePath, scaleRatio);
    if (uploadResult.code !== 200) throw new Error("Upload failed");

    const { code } = uploadResult.data;
    for (let i = 0; i < 30; i++) {
      const statusResult = await imgupscale.cek(code, scaleRatio);
      if (statusResult.code === 200 && statusResult.data.status === "success") {
        return statusResult.data.downloadUrls[0];
      }
      // تقليل وقت الانتظار لزيادة السرعة
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error("Timeout");
  },
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.quoted || !/image/.test(m.quoted.mimetype || "")) {
    return conn.reply(m.chat, `❗ رد على صورة بـ ${usedPrefix + command} `, m, global.rcanal);
  }

  const scale = args[0]?.replace(/x/i, "") || "2";
  
  try {
    // تفاعل سريع للتأكيد
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const buffer = await m.quoted.download();
    const tmpPath = path.join(process.cwd(), `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tmpPath, buffer);

    const resultUrl = await imgupscale.upscale(tmpPath, Number(scale));
    fs.unlinkSync(tmpPath);

    // الإرسال مباشرة من الرابط لتوفير وقت التحميل
    await conn.sendMessage(m.chat, { 
        image: { url: resultUrl }, 
        caption: `✅ تم التحسين بنجاح (${scale}x)`,
        contextInfo: global.rcanal.contextInfo 
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (err) {
    conn.reply(m.chat, "❌ حدث خطأ، حاول مرة أخرى.", m, global.rcanal);
  }
};

handler.help = ["remini3"];
handler.arabic = ['ريميني3'];
handler.command = ["remini3"];
handler.tags = ["tools"];
handler.limit = true;

export default handler;
