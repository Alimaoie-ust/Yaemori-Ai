//plugins by Li maoie 
// يساعد على تغير الحقوق في اي بوت عبر البحث عن اسماء او ارقام وروابط وتغيرها بالكامل ب امر واحد من صناعة علي موى و chatgpt 😂🤣

// ====== نظام الحماية الأساسي ======
if (typeof global.devali === "undefined") {
    throw new Error("❌ نظام الحماية اشتغل وهذا يعني انك لست مالك البوت الحقيقي توقف التشغيل.");
}

const REAL_OWNER = `212621240${global.devali}`;
// ==================================

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

let handler = async (m, { conn, text, command }) => {
    
    const sender = m.sender.split("@")[0];
    if (sender !== REAL_OWNER) {
        return conn.reply(m.chat, "❌ وصول مرفوض! أنت لست المالك الحقيقي.", m);
    }

    const pluginsDir = path.join(process.cwd(), "plugins");

    // SCAN
    if (command === "scan") {
        if (!text) return m.reply("⚠️ اكتب كلمة للبحث.\nمثال: .scan nataly");

        let results = [];

        for (let file of fs.readdirSync(pluginsDir)) {
            let filePath = path.join(pluginsDir, file);
            if (fs.statSync(filePath).isFile() && file.endsWith(".js")) {
                let content = fs.readFileSync(filePath, "utf8");
                if (content.includes(text)) {
                    results.push(file);
                }
            }
        }

        if (!results.length) return m.reply(`❌ لا يوجد أي ملف يحتوي: *${text}*`);

        let message = `🔍 تم العثور على *${text}* في:\n\n`;
        for (let f of results) message += `• ${f}\n`;

        return m.reply(message);
    }

    // CHANG
    if (command === "chang") {
        let [oldWord, newWord] = text.split(" ");
        if (!oldWord || !newWord) {
            return m.reply("⚠️ الاستعمال:\n.chang القديم الجديد\nمثال: .chang nataly emillia");
        }

        let changedFiles = [];

        for (let file of fs.readdirSync(pluginsDir)) {
            let filePath = path.join(pluginsDir, file);
            if (fs.statSync(filePath).isFile() && file.endsWith(".js")) {
                let content = fs.readFileSync(filePath, "utf8");

                if (content.includes(oldWord)) {
                    let newContent = content.split(oldWord).join(newWord);
                    fs.writeFileSync(filePath, newContent);
                    changedFiles.push(file);
                }
            }
        }

        if (!changedFiles.length) {
            return m.reply(`❌ لا يوجد أي ملف يحتوي: *${oldWord}*`);
        }

        // ====== إنشاء ملف ZIP يحتوي الملفات المعدّلة ======
        const zipPath = path.join(process.cwd(), "changed_files.zip");

        try {
            // حذف ZIP القديم إن وُجد
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

            // بناء أمر zip
            const filesList = changedFiles.map(f => `"plugins/${f}"`).join(" ");
            const zipCommand = `zip -r ${zipPath} ${filesList}`;

            execSync(zipCommand);

        } catch (e) {
            console.error(e);
            return m.reply("⚠️ حدث خطأ أثناء إنشاء ملف ZIP");
        }

        // ====== إرسال الرسالة مع زر التحميل ======
        let msg = await conn.sendMessage(m.chat, {
            text: `✅ تم استبدال *${oldWord}* بـ *${newWord}*\n📦 عدد الملفات المعدّلة: *${changedFiles.length}*\n\nاضغط أدناه لتحميل الملفات المعدلة.`,
            footer: "Li Maoie Plugins",
            buttons: [
                {
                    buttonId: "download_changed_files",
                    buttonText: { displayText: "📥 تحميل الملفات" },
                    type: 1
                }
            ],
            headerType: 1
        });

        // حفظ بيانات الملفات المعدلة لكي يتم إرسالها عند الضغط على الزر
        conn.changedZip = zipPath;
        return msg;
    }
};

// ====== مستمع للزر ======
handler.before = async (m, { conn }) => {
    if (m?.message?.buttonsResponseMessage?.selectedButtonId === "download_changed_files") {
        if (conn.changedZip && fs.existsSync(conn.changedZip)) {
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(conn.changedZip),
                mimetype: "application/zip",
                fileName: "changed_files.zip"
            });
        } else {
            m.reply("⚠️ لا يوجد ملف ZIP!");
        }
    }
};

handler.help = ["scan", "chang"];
handler.tags = ['owner'];
handler.command = ["scan", "chang"];
handler.owner = true;
handler.rowner = true;

export default handler;