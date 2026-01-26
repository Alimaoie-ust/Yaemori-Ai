import fs from 'fs';
const MUTE_FILE = './temporary_mutes.json';

function loadMutes() {
    if (!fs.existsSync(MUTE_FILE)) return {};
    return JSON.parse(fs.readFileSync(MUTE_FILE));
}

function saveMutes(data) {
    fs.writeFileSync(MUTE_FILE, JSON.stringify(data, null, 2));
}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (m.isBaileys || !m.isGroup) return true;
    
    let chat = global.db.data.chats[m.chat] || {};
    let user = global.db.data.users[m.sender] || {};
    let lang = chat.langmenu || 'ar';
    let mutes = loadMutes();

    // فحص الإسكات المؤقت
    if (mutes[m.chat] && mutes[m.chat][m.sender]) {
        if (Date.now() < mutes[m.chat][m.sender].expireAt) {
            await conn.sendMessage(m.chat, { delete: m.key });
            return false; 
        } else {
            delete mutes[m.chat][m.sender];
            saveMutes(mutes);
        }
    }

    if (isAdmin || !isBotAdmin || m.fromMe) return true;

    // تحديد نوع الوسائط المرسلة
    const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi;
    let isLink = m.text && m.text.match(linkRegex);
    let isImg = m.mtype === 'imageMessage';
    let isVideo = m.mtype === 'videoMessage';
    let isAudio = m.mtype === 'audioMessage';
    let isSticker = m.mtype === 'stickerMessage';
    let isDoc = m.mtype === 'documentMessage';

    // التحقق من الحماية المفعلة
    let trigger = false;
    let typeName = "";

    if (isLink && chat.antilink) { trigger = true; typeName = lang === 'ar' ? "الروابط" : "Links"; }
    else if (isImg && chat.antiimg) { trigger = true; typeName = lang === 'ar' ? "الصور" : "Images"; }
    else if (isVideo && chat.antivideo) { trigger = true; typeName = lang === 'ar' ? "الفيديوهات" : "Videos"; }
    else if (isAudio && chat.antiaudio) { trigger = true; typeName = lang === 'ar' ? "البصمات/الصوت" : "Audio/VN"; }
    else if (isSticker && chat.antisticker) { trigger = true; typeName = lang === 'ar' ? "الملصقات" : "Stickers"; }
    else if (isDoc && chat.antidoc) { trigger = true; typeName = lang === 'ar' ? "المستندات" : "Documents"; }

    if (trigger) {
        await conn.sendMessage(m.chat, { delete: m.key });
        user.warnCount = (user.warnCount || 0) + 1;

        if (user.warnCount >= 7) {
            user.totalMutes = (user.totalMutes || 0) + 1;
            user.warnCount = 0;
            
            let muteDuration = 7 * 60 * 1000;
            if (user.totalMutes >= 20) muteDuration = 5 * 60 * 60 * 1000;
            else if (user.totalMutes >= 7) muteDuration = 30 * 60 * 1000;
            else if (user.totalMutes >= 3) muteDuration = 14 * 60 * 1000;

            if (!mutes[m.chat]) mutes[m.chat] = {};
            mutes[m.chat][m.sender] = { expireAt: Date.now() + muteDuration };
            saveMutes(mutes);

            let msg = lang === 'ar' ? `🔇 تم إسكات @${m.sender.split('@')[0]} لتجاوزه القوانين.` : `🔇 @${m.sender.split('@')[0]} muted for breaking rules.`;
            await conn.reply(m.chat, msg, m, { mentions: [m.sender], ...global.rcanal });
        } else {
            let msg = lang === 'ar' ? `⚠️ ممنوع إرسال ${typeName} [${user.warnCount}/7]` : `⚠️ ${typeName} are not allowed [${user.warnCount}/7]`;
            await conn.reply(m.chat, msg, m, { mentions: [m.sender], ...global.rcanal });
        }
        return false;
    }
    return true;
}
