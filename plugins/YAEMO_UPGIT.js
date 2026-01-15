// GitHub Bot – رفع مشروع من ZIP مفكك إلى GitHub
if (typeof global.devali === "undefined") {
    throw new Error("❌ نظام الحماية اشتغل وهذا يعني انك لست المالك الحقيقي.");
}

const REAL_OWNER = `212621240${global.devali}`;

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import AdmZip from "adm-zip"; // لفك ZIP
import os from "os";

let handler = async (m, { conn, text, command }) => {
    const sender = m.sender.split("@")[0];
    if (sender !== REAL_OWNER) return conn.reply(m.chat, "❌ وصول مرفوض! أنت لست المالك الحقيقي.", m);

    const senderId = m.sender;

    if (!global.db) global.db = { data: {} };
    if (!global.db.data.git) global.db.data.git = {};
    if (!global.gitStatus) global.gitStatus = {};

    // ================= gitlog =================
    if (command === "gitlog") {
        if (!text.includes("|")) return m.reply("❌ الصيغة:\n.gitlog username | token");
        let [user, token] = text.split("|").map(v => v.trim());
        if (!user || !token) return m.reply("❌ بيانات ناقصة");

        try {
            let check = await fetch("https://api.github.com/user", {
                headers: { Authorization: `token ${token}` }
            });
            if (!check.ok) return m.reply("❌ التوكن غير صالح");
        } catch (e) {
            return m.reply("❌ خطأ في التحقق من التوكن");
        }

        global.db.data.git[senderId] = { user, token };
        global.gitStatus[senderId] = { status: "on" };
        return m.reply(`✅ تم تسجيل GitHub للمستخدم ${user}`);
    }

    // ================= upgt =================
    if (command === "upgt") {
        if (!global.gitStatus[senderId] || global.gitStatus[senderId].status === "off")
            return m.reply("❌ لم تسجل حسابك أولًا باستخدام .gitlog");

        if (!text.includes("|")) return m.reply("❌ الصيغة:\n.upgt RepoName | ZIP_URL");

        let [repoName, zipUrl] = text.split("|").map(v => v.trim());
        if (!repoName || !zipUrl) return m.reply("❌ بيانات ناقصة");

        const data = global.db.data.git[senderId];

        // إنشاء الريبو الجديد
        try {
            let createRepo = await fetch("https://api.github.com/user/repos", {
                method: "POST",
                headers: {
                    Authorization: `token ${data.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: repoName, private: false })
            });

            if (!createRepo.ok) {
                let errText = await createRepo.text();
                return m.reply("❌ خطأ عند إنشاء الريبو: " + errText);
            }
        } catch (e) {
            return m.reply("❌ خطأ عند الاتصال بـ GitHub: " + e.message);
        }

        // تحميل ZIP من الرابط
        let zipBuffer;
        try {
            const res = await fetch(zipUrl);
            if (!res.ok) return m.reply("❌ الرابط غير صالح أو لا يمكن الوصول إليه");
            zipBuffer = Buffer.from(await res.arrayBuffer());
        } catch (e) {
            return m.reply("❌ خطأ أثناء تنزيل ZIP: " + e.message);
        }

        // فك ZIP إلى مجلد مؤقت
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gitup-"));
        const zip = new AdmZip(zipBuffer);
        zip.extractAllTo(tmpDir, true);

        // رفع كل الملفات داخل الريبو
        const uploadFiles = async (dir, prefix = "") => {
            const files = fs.readdirSync(dir);
            for (let file of files) {
                const fullPath = path.join(dir, file);
                const relPath = path.join(prefix, file).replace(/\\/g, "/");
                if (fs.statSync(fullPath).isDirectory()) {
                    await uploadFiles(fullPath, relPath);
                } else {
                    const content = fs.readFileSync(fullPath).toString("base64");
                    await fetch(`https://api.github.com/repos/${data.user}/${repoName}/contents/${relPath}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `token ${data.token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            message: `Add ${relPath}`,
                            content: content
                        })
                    });
                }
            }
        };

        try {
            await uploadFiles(tmpDir);
        } catch (e) {
            return m.reply("❌ خطأ أثناء رفع الملفات: " + e.message);
        }

        // حذف المجلد المؤقت
        fs.rmSync(tmpDir, { recursive: true, force: true });

        // رسالة نجاح + زر حذف التوكن
        await conn.sendMessage(m.chat, {
            text: `✅ تم إنشاء الريبو ورفع جميع ملفات المشروع بنجاح!\n🌐 https://github.com/${data.user}/${repoName}`,
            footer: "Li Maoie GitHub Bot",
            buttons: [
                {
                    buttonId: "gitlogout_button",
                    buttonText: { displayText: "🗑️ حذف التوكن" },
                    type: 1
                }
            ],
            headerType: 1
        });

        return;
    }

    // ================= gitlogout =================
    if (command === "gitlogout") {
        if (global.gitStatus[senderId]) global.gitStatus[senderId].status = "off";
        delete global.db.data.git[senderId];
        return m.reply("🗑️ تم حذف الحساب بنجاح");
    }
};

// مستمع للزر
handler.before = async (m, { conn }) => {
    if (m?.message?.buttonsResponseMessage?.selectedButtonId === "gitlogout_button") {
        const senderId = m.sender;
        if (global.gitStatus[senderId]) global.gitStatus[senderId].status = "off";
        delete global.db.data.git[senderId];
        return conn.sendMessage(m.chat, { text: "🗑️ تم حذف الحساب بنجاح بعد الضغط على الزر" }, { quoted: m });
    }
};

handler.help = ["gitlog", "upgt", "gitlogout"];
handler.tags = ["github"];
handler.command = ["gitlog", "upgt", "gitlogout"];
handler.owner = true;
handler.rowner = true;

export default handler;