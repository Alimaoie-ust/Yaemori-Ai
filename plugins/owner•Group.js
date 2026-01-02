let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text }) => {
    const thumb = "https://raw.githubusercontent.com/alimaoie-us/Nataly-AI/main/src/Nataly.jpg";
    const kanal = global.url?.sgc || "https://whatsapp.com/channel/0029Vb71THB0bIdswhCzVJ0f";

    if (!text) {
        return m.reply(`❗️استعمال الأمر:\n\n• *.nata join <link>*\n• *.nata getout*\n• *.nata getout <link>*`);
    }

    let args = text.trim().split(/\s+/);
    let action = args[0]?.toLowerCase();
    let link = args[1];

    // ======================================================
    // 🟩 1 — JOIN GROUP
    // ======================================================
    if (action === "join") {

        if (!link) return m.reply("❗️ارسل رابط المجموعة بعد كلمة join\nمثال:\n*.nata join https://chat.whatsapp.com/XXXX*");

        let match = link.match(linkRegex);
        if (!match) return m.reply("❌ رابط غير صالح!");

        let code = match[1];

        try {
            // دخول المجموعة
            let id = await conn.groupAcceptInvite(code);

            // رسالة للمطور بصيغة fake message لتفعيل الترحيب
            if (global.nomerown) {
                let fakeMsg = {
                    key: { fromMe: false, participant: `${m.sender}` },
                    message: {
                        conversation: `.welcome ${id}` // هذا الأمر سيُستخدم لتفعيل الترحيب لاحقًا
                    }
                };
                await conn.sendMessage(global.nomerown + "@s.whatsapp.net", {
                    text: `✅ دخلت مجموعة جديدة.\n🆔: ${id}\n👤 بواسطة: ${m.sender.split('@')[0]}`,
                    contextInfo: { quotedMessage: fakeMsg }
                });
            }

            return m.reply("✅ **تم الدخول إلى المجموعة بنجاح!**");

        } catch (e) {
            console.log(e);
            return m.reply("⚠️ لم أستطع دخول المجموعة، الرابط غير صالح أو تم إلغاء الدعوة.");
        }
    }

    // ======================================================
    // 🟥 2 — GET OUT
    // ======================================================
    if (action === "getout") {

        // -------------------------------
        // الخروج من مجموعة عبر رابط
        // -------------------------------
        if (link) {
            let match = link.match(linkRegex);
            if (!match) return m.reply("❌ رابط غير صالح!");

            let code = match[1];

            try {
                let info = await conn.groupGetInviteInfo(code);

                let bye = `*لقد انتهت مهمتي هنا*\n\nتلقيت أمرًا بالخروج وداعًا 👋\nأتمنى لكم مسيرة موفقة 🫴`;

                await conn.sendMessage(info.id, { 
                    image: { url: thumb },
                    caption: bye
                });

                await conn.groupLeave(info.id);

                if (global.nomerown) {
                    await conn.sendMessage(global.nomerown + "@s.whatsapp.net", {
                        text: `🚪 خرجت من مجموعة عبر رابط.\n📛: ${info.subject}\n🆔: ${info.id}\n👤 بواسطة: ${m.sender.split('@')[0]}`
                    });
                }

                return m.reply(`🚪 تم الخروج من المجموعة:\n*${info.subject}*`);

            } catch (e) {
                return m.reply("⚠️ لم أستطع الخروج، ربما الرابط خاطئ.");
            }
        }

        // -------------------------------
        // الخروج من المجموعة الحالية
        // -------------------------------
        if (!m.isGroup) return m.reply("❗️هذا الأمر يجب استخدامه داخل مجموعة.");

        try {
            let bye = `*لقد انتهت مهمتي هنا*\n\nتلقيت أمرًا بالخروج وداعًا 👋\nأتمنى لكم مسيرة موفقة 🫴`;

            await conn.sendMessage(m.chat, { 
                image: { url: thumb },
                caption: bye
            });

            await conn.groupLeave(m.chat);

            if (global.nomerown) {
                await conn.sendMessage(global.nomerown + "@s.whatsapp.net", {
                    text: `🚪 خرجت من مجموعة.\n🆔: ${m.chat}\n👤 بواسطة: ${m.sender.split('@')[0]}`
                });
            }

        } catch (e) {
            return m.reply("⚠️ لم أستطع الخروج.");
        }

        return;
    }

    return m.reply("❗️أمر غير معروف. استعمل:\n*.nata join <link>* أو *.nata getout*");
};

handler.help = ["nata"];
handler.tags = ["owner"];
handler.command = /^nata$/i;
handler.rowner = true;

export default handler;