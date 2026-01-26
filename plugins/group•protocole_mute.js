import fs from 'fs';
const MUTE_FILE = './temporary_mutes.json';

let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    if (!isAdmin) return;
    let chat = global.db.data.chats[m.chat] || {};
    let lang = m.isGroup ? (chat.langmenu || 'ar') : (global.db.data.users[m.sender].langmenu || 'ar');
    let mutes = fs.existsSync(MUTE_FILE) ? JSON.parse(fs.readFileSync(MUTE_FILE)) : {};

    const strings = {
        ar: {
            title: "*🔓 قائمة العفو (فك الإسكات)*",
            footer: "نظام إدارة العقوبات",
            btnTitle: "🔓 استعراض المسكوتين",
            sectionTitle: "الأعضاء تحت الإسكات حالياً",
            all: "🌟 الإعفاء عن الجميع",
            empty: "✅ لا يوجد أحد تحت الإسكات حالياً.",
            successOne: "✅ تم إلغاء الإسكات بنجاح.",
            successAll: "✅ تم الإعفاء عن الجميع بنجاح.",
            remaining: "متبقي"
        },
        en: {
            title: "*🔓 Pardon (Unmute) List*",
            footer: "Penalty Management System",
            btnTitle: "🔓 Browse Muted Users",
            sectionTitle: "Currently Muted Members",
            all: "🌟 Unmute Everyone",
            empty: "✅ No one is currently muted.",
            successOne: "✅ Member has been unmuted.",
            successAll: "✅ All members have been unmuted.",
            remaining: "Remaining"
        }
    }[lang];

    const s = strings;

    // منطق الإعفاء
    if (args[0] === 'all') {
        if (mutes[m.chat]) {
            delete mutes[m.chat];
            fs.writeFileSync(MUTE_FILE, JSON.stringify(mutes, null, 2));
            return conn.reply(m.chat, s.successAll, m, global.rcanal);
        }
    }

    if (args[0]) {
        let target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (mutes[m.chat] && mutes[m.chat][target]) {
            delete mutes[m.chat][target];
            fs.writeFileSync(MUTE_FILE, JSON.stringify(mutes, null, 2));
            return conn.reply(m.chat, s.successOne, m, { mentions: [target], ...global.rcanal });
        }
    }

    let groupMutes = mutes[m.chat] ? Object.entries(mutes[m.chat]) : [];
    if (groupMutes.length === 0) return conn.reply(m.chat, s.empty, m, global.rcanal);

    let rows = await Promise.all(groupMutes.map(async ([id, data]) => {
        let name = await conn.getName(id);
        let remain = Math.round((data.expireAt - Date.now()) / 60000);
        return {
            title: name,
            description: `@${id.split('@')[0]} | ${s.remaining}: ${remain} min`,
            id: `${usedPrefix + command} ${id.split('@')[0]}`
        };
    }));

    rows.unshift({ title: s.all, id: `${usedPrefix + command} all` });

    const msg = {
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
    };
    await conn.relayMessage(m.chat, { viewOnceMessage: msg }, {});
}

handler.help = ['unmute']
handler.arabic = ['اعفاء']
handler.command = /^(unmute|اعفاء)$/i
handler.admin = true
handler.group = true
export default handler;
