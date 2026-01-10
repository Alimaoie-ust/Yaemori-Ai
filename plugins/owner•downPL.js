import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

let handler = async (m, { conn, text }) => {

    // لو المستخدم كتب فقط .dw → نرسل قائمة منبثقة بكل محتويات plugins
    if (!text) {

        const base = path.join(process.cwd(), 'plugins');
        if (!fs.existsSync(base)) return m.reply("❌ مجلد plugins غير موجود!");

        // قراءة الملفات والمجلدات داخل plugins
        let list = fs.readdirSync(base);

        let rows = [];

        for (let item of list) {
            let full = path.join(base, item);

            rows.push({
                header: fs.statSync(full).isDirectory() ? "📁 مجلد" : "📄 ملف",
                title: item,
                description: "",
                id: `.dw plugins/${item}` // عند الضغط → ينفذ الأمر تلقائياً
            });
        }

        // بناء القائمة المنبثقة بنفس هيكل template.js
        const datas = {
            title: "📦ـ Plugins",
            sections: [
                {
                    title: "اختر ملفًا أو مجلدًا للتحميل",
                    highlight_label: "Plugins",
                    rows: rows
                }
            ]
        };

        const thumb = "https://raw.githubusercontent.com/alimaoie-us/Nataly-AI/main/src/Nataly.jpg";

        return conn.sendListImageButton(
            m.chat,
            "📦 قائمة ملفات الـ Plugins",
            datas,
            "اختر العنصر الذي تريد تحميله",
            thumb
        );
    }

    // === من هنا يبدأ النظام العادي لتحميل ملف/مجلد ===

    const target = path.join(process.cwd(), text);

    if (!fs.existsSync(target)) {
        return m.reply("❌ المسار غير موجود!");
    }

    // تحميل ملف
    if (fs.statSync(target).isFile()) {
        return conn.sendMessage(
            m.chat,
            {
                document: fs.readFileSync(target),
                fileName: path.basename(target),
                mimetype: "application/octet-stream"
            },
            { quoted: m }
        );
    }

    // تحميل مجلد
    let zipName = text.replace(/\//g, "_") + ".zip";
    let zipPath = path.join(process.cwd(), zipName);

    exec(`zip -r "${zipPath}" "${text}"`, async (err) => {
        if (err) return m.reply("❌ خطأ: zip غير مثبت في السيرفر.");

        await conn.sendMessage(
            m.chat,
            {
                document: fs.readFileSync(zipPath),
                fileName: zipName,
                mimetype: "application/zip"
            },
            { quoted: m }
        );

        fs.unlinkSync(zipPath);
        m.reply("📦 تم إرسال الملف / المجلد بنجاح!");
    });
};

handler.help = ["dw"];
handler.tags = ["owner"];
handler.command = ["dw"];
handler.rowner = true;
handler.owner = true;
export default handler;