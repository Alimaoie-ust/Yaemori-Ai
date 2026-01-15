import fs from 'fs';
import path from 'path';

const dataFolder = './data'; // مسار حفظ بيانات الألقاب
if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);

// دالة لجلب الألقاب المسجلة للمجموعة
const getGroupDataFilePath = (groupId) => path.join(dataFolder, `${groupId}.json`);

const getMemberTitle = (groupId, username) => {
    const filePath = getGroupDataFilePath(groupId);
    if (fs.existsSync(filePath)) {
        const members = JSON.parse(fs.readFileSync(filePath));
        const member = members.find(m => m.username === username);
        return member ? `┇${member.title}┇` : '┇بدون لقب┇';
    }
    return '┇بدون لقب┇';
};

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
    if (usedPrefix == 'a' || usedPrefix == 'A') return;
    if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        return;
    }

    const pesan = args.join` ` || "لم يتم إدخال رسالة";
    
    // جلب معلومات المجموعة
    const groupMetadata = await conn.groupMetadata(m.chat);
    const groupName = groupMetadata.subject || "المجموعة";
    const totalMembers = participants.length;

    // العثور على مالك الجروب (إن وجد)
    let owner = participants.find(p => p.admin === 'superadmin' || p.isSuperAdmin);
    let ownerTag = owner ? `@${owner.id.split('@')[0]}` : 'لم يتم العثور على المالك';

    // قسم المشرفين
    let adminTags = '';
    let admins = participants.filter(p => p.admin === 'admin' && p !== owner); // استبعاد المالك من المشرفين
    for (const admin of admins) {
        const title = getMemberTitle(m.chat, admin.id.split('@')[0]);
        adminTags += `*👑╎↫* @${admin.id.split('@')[0]} ${title}\n`;
    }
    adminTags = adminTags || 'لا يوجد مشرفين';

    // قسم الأعضاء العاديين
    let memberTags = '';
    let members = participants.filter(p => !p.admin);
    for (const member of members) {
        const title = getMemberTitle(m.chat, member.id.split('@')[0]);
        memberTags += `*👤╎↫* @${member.id.split('@')[0]} ${title}\n`;
    }
    memberTags = memberTags || 'لا يوجد أعضاء';

    // إنشاء الرسالة
    let teks = `*𝙤𝙬𝙣𝙚𝙧~𝙖𝙡𝙞 ❦︎*\n`;
    teks += `*⟬ الـرسـالـه 📩┇↜ ${pesan} ⟭*\n\n`;
    teks += `*⟬ اسم المجموعه ⚙️┇↜ ${groupName} ⟭*\n`;
    teks += `*⟬ عـدد اعـضـاء الـمـجـمـوعـة 👤 ┇ ${totalMembers} ⟭*\n\n`;
    teks += `*⟬ مالك الجروب 👑┇↜ ${ownerTag} ⟭*\n\n`;
    teks += `*❅ الـمـشـرفـيـن 🔰┇↯↯*\n${adminTags}\n`;
    teks += `*⟬ 🧑‍🧑‍🧒‍🧒┇الـمـنـشـن⤣🔥⤤الـجـمـاعـي┇🧑‍🧑‍🧒‍🧒 ⟭*\n${memberTags}\n`;
    teks += `*تم ارسال المنشن لـ ${totalMembers} اعضاء*\n\n`;
    teks += `◦❪╭⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔𝓛𝓲𝓰𝓱𝓽࿐<AI>╯❫◦`;

    // إرسال الرسالة مع الإشارة إلى الجميع
    conn.sendMessage(m.chat, { text: teks, mentions: participants.map(a => a.id) });
};

handler.help = ['tagall'];
handler.arabic = ['منشن'];
handler.tags = ['group'];
handler.command = ['tagall', 'منشن'];
handler.admin = true;
handler.group = true;

export default handler;