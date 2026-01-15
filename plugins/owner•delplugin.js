import { tmpdir } from "os";
import path, { join } from "path";
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch,
} from "fs";

let handler = async (
  m,
  { conn, usedPrefix, usedPrefix: _p, __dirname, args, text, command },
) => {
  let ar = Object.keys(plugins);
  let ar1 = ar.map((v) => v.replace(".js", ""));

  // التحقق من إدخال اسم الملف
  if (!text) return conn.reply(m.chat, `❗ يرجى كتابة اسم الملف المراد حذفه.\n\n*مثال:*\n${usedPrefix + command} info`, m, global.rcanal);

  // التأكد من وجود الملف في قائمة الإضافات
  if (!ar1.includes(args[0]))
    return conn.reply(
      m.chat,
      `❌ *الملف غير موجود!*\n\nإليك قائمة بالملفات المتاحة:\n==================================\n\n${ar1.map((v) => " 📁 " + v).join`\n`}`,
      m,
      global.rcanal
    );

  try {
    const file = join(__dirname, "../plugins/" + args[0] + ".js");
    
    // التحقق الفعلي من وجود الملف في المسار قبل الحذف
    if (existsSync(file)) {
        unlinkSync(file);
        await conn.sendMessage(m.chat, { react: { text: "🗑️", key: m.key } });
        conn.reply(m.chat, `✅ تم حذف الملف सफलतापूर्वक:\n*plugins/${args[0]}.js*`, m, global.rcanal);
    } else {
        conn.reply(m.chat, `⚠️ الملف موجود في الذاكرة ولكن لم يتم العثور عليه في المسار المذكور.`, m, global.rcanal);
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `❌ حدث خطأ أثناء محاولة حذف الملف.`, m, global.rcanal);
  }
};

handler.help = ["deleteplugin"];
handler.arabic = ['df'];
handler.tags = ["owner"];
handler.command = ["deleteplugin", "df"];
handler.mods = true; // متاح فقط للمطورين

export default handler;
