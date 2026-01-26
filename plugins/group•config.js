let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    if (!isAdmin) return;
    let chat = global.db.data.chats[m.chat] || {};
    let lang = m.isGroup ? (chat.langmenu || 'ar') : (global.db.data.users[m.sender].langmenu || 'ar');

    const strings = {
        ar: {
            title: "*🛡️ مركز حماية يايموري*",
            footer: "نظام حماية المجموعات المطور",
            btnTitle: "⚙️ إعدادات الحماية",
            sectionTitle: "خيارات التحكم بالوسائط",
            allOn: "🌟 تفعيل الكل (All ON)",
            allOff: "🚫 تعطيل الكل (All OFF)",
            msgAllOn: "✅ تم تفعيل كافة الحمايات بنجاح.",
            msgAllOff: "❌ تم تعطيل كافة الحمايات بنجاح.",
            statusOn: "مفعل 🟢",
            statusOff: "معطل 🔴"
        },
        en: {
            title: "*🛡️ Yaemori Protection Center*",
            footer: "Advanced Group Protection System",
            btnTitle: "⚙️ Protection Settings",
            sectionTitle: "Media Control Options",
            allOn: "🌟 Enable All (All ON)",
            allOff: "🚫 Disable All (All OFF)",
            msgAllOn: "✅ All protections have been enabled.",
            msgAllOff: "❌ All protections have been disabled.",
            statusOn: "Enabled 🟢",
            statusOff: "Disabled 🔴"
        }
    }[lang];

    const s = strings;
    let type = (args[0] || '').toLowerCase();

    // تفعيل/تعطيل الكل
    if (type === 'allon' || type === 'alloff') {
        let status = type === 'allon';
        chat.antilink = chat.antiimg = chat.antivideo = chat.antiaudio = chat.antisticker = chat.antidoc = status;
        return conn.reply(m.chat, status ? s.msgAllOn : s.msgAllOff, m, global.rcanal);
    }

    // تفعيل مفرد
    const validTypes = ['antilink', 'antiimg', 'antivideo', 'antiaudio', 'antisticker', 'antidoc'];
    if (validTypes.includes(type)) {
        chat[type] = !chat[type];
        return conn.reply(m.chat, `✅ ${type}: ${chat[type] ? s.statusOn : s.statusOff}`, m, global.rcanal);
    }

    // بناء القائمة (List)
    const rows = [
        { title: s.allOn, id: `${usedPrefix + command} allon` },
        { title: s.allOff, id: `${usedPrefix + command} alloff` },
        { title: `Anti-Link ${chat.antilink ? s.statusOn : s.statusOff}`, id: `${usedPrefix + command} antilink` },
        { title: `Anti-Image ${chat.antiimg ? s.statusOn : s.statusOff}`, id: `${usedPrefix + command} antiimg` },
        { title: `Anti-Video ${chat.antivideo ? s.statusOn : s.statusOff}`, id: `${usedPrefix + command} antivideo` },
        { title: `Anti-Audio/VN ${chat.antiaudio ? s.statusOn : s.statusOff}`, id: `${usedPrefix + command} antiaudio` },
        { title: `Anti-Sticker ${chat.antisticker ? s.statusOn : s.statusOff}`, id: `${usedPrefix + command} antisticker` },
        { title: `Anti-Document ${chat.antidoc ? s.statusOn : s.statusOff}`, id: `${usedPrefix + command} antidoc` }
    ];

    const msg = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: s.title },
                    footer: { text: s.footer },
                    nativeFlowMessage: {
                        buttons: [
                            { name: 'single_select', buttonParamsJson: JSON.stringify({ title: s.btnTitle, sections: [{ title: s.sectionTitle, rows }] }) },
                            { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '📢 Channel', url: 'https://whatsapp.com/channel/0029VbBq99KBlHpjaWQsPF2J' }) },
                            { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '📸 Instagram', url: 'https://www.instagram.com/ali_progs' }) }
                        ]
                    },
                    contextInfo: global.rcanal.contextInfo
                }
            }
        }
    };
    await conn.relayMessage(m.chat, msg, {});
}

handler.help = ['protection']
handler.arabic = ['حماية']
handler.command = /^(حماية|protection)$/i
handler.admin = true
handler.group = true
export default handler;
