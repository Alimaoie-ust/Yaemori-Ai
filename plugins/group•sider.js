let handler = async (m, { conn, text, groupMetadata, usedPrefix }) => {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    // 1. تحديد اللغة (مجموعة أو خاص)
    let chat = global.db.data.chats[m.chat] || {}
    let user = global.db.data.users[m.sender] || {}
    let lang = m.isGroup ? (chat.langmenu || 'ar') : (user.langmenu || 'ar')

    // 2. مصفوفة النصوص المترجمة
    const strings = {
        ar: {
            wait: "جاري الفحص... يرجى الانتظار ⏳",
            noSider: "✅ *المجموعة نشطة بالكامل!* لا يوجد أي أصنام حالياً.",
            title: "🔍 *كشف الأعضاء غير النشطين (الأصنام)*",
            group: "📍 *المجموعة:*",
            stats: "📊 *الإحصائيات:*",
            member: "عضو غير نشط",
            reasons: "⚠️ *الأسباب:* \n1. لم يظهر أي نشاط منذ أكثر من 7 أيام.\n2. انضم للمجموعة ولم يشارك أبداً.",
            devMsg: "💬 *رسالة المطور:*",
            listTitle: "*قائمة الأصنام:*",
            defaultPesan: "يرجى التفاعل في المجموعة لتجنب الطرد أثناء التنظيف الدوري للمكان 🧹",
            notReg: "خمول تام"
        },
        en: {
            wait: "Checking... please wait ⏳",
            noSider: "✅ *The group is fully active!* No siders found.",
            title: "🔍 *Sider Detection (Inactive Members)*",
            group: "📍 *Group:*",
            stats: "📊 *Statistics:*",
            member: "inactive members",
            reasons: "⚠️ *Reasons:* \n1. No activity for more than 7 days.\n2. Joined but never participated.",
            devMsg: "💬 *Developer Message:*",
            listTitle: "*Sider List:*",
            defaultPesan: "Please be active in the group to avoid being kicked during cleaning 🧹",
            notReg: "Never active"
        }
    }

    const s = strings[lang] || strings['ar']

    var lama = 86400000 * 7
    const milliseconds = new Date().getTime();
    let member = groupMetadata.participants.map(v => v.id)
    
    var pesan = text ? text : s.defaultPesan
    
    var sum = member.length
    var total = 0
    var sider = []

    for (let i = 0; i < sum; i++) {
        let users = groupMetadata.participants.find(u => u.id == member[i])
        if ((typeof global.db.data.users[member[i]] == 'undefined' || milliseconds - global.db.data.users[member[i]].lastseen > lama) && !users.isAdmin && !users.isSuperAdmin) {
            total++
            sider.push(member[i])
        }
    }

    if (total == 0) return conn.reply(m.chat, s.noSider, m, global.rcanal)

    let caption = `${s.title}\n\n`
    caption += `${s.group} ${await conn.getName(m.chat)}\n`
    caption += `${s.stats} [ ${total} / ${sum} ] ${s.member}\n\n`
    caption += `${s.reasons}\n\n`
    caption += `${s.devMsg} \n_"${pesan}"_\n\n`
    caption += `${s.listTitle}`

    let listSider = sider.map(v => {
        let lastSeen = global.db.data.users[v] ? (milliseconds - global.db.data.users[v].lastseen) : null
        let timeStr = lastSeen ? msToDate(lastSeen, lang) : s.notReg
        return `  • @${v.replace(/@.+/, '')} ➔ [ ${timeStr} ]`
    }).join('\n')

    conn.reply(m.chat, `${caption}\n${listSider}`, m, {
        contextInfo: {
            ...global.rcanal.contextInfo,
            mentionedJid: sider
        }
    })
}

handler.help = ['gcsider']
handler.arabic = ['كشف_اصنام', 'الاصنام']
handler.tags = ['group']
handler.command = /^(gcsider|كشف_اصنام|الاصنام)$/i
handler.group = true
handler.admin = true 

export default handler;

// دالة تحويل الوقت تدعم اللغتين
function msToDate(ms, lang) {
    if (isNaN(ms)) return lang === 'ar' ? "غير معروف" : "Unknown"
    let d = Math.floor(ms / 86400000)
    let h = Math.floor(ms / 3600000) % 24
    let m = Math.floor(ms / 60000) % 60
    
    if (d === 0 && h === 0 && m === 0) return lang === 'ar' ? "منذ ثوانٍ" : "Just now"
    
    let result = []
    if (lang === 'ar') {
        if (d > 0) result.push(`${d} يوم`)
        if (h > 0) result.push(`${h} ساعة`)
        if (m > 0) result.push(`${m} دقيقة`)
        return "غائب منذ " + result.join(' و ')
    } else {
        if (d > 0) result.push(`${d}d`)
        if (h > 0) result.push(`${h}h`)
        if (m > 0) result.push(`${m}m`)
        return "Offline for " + result.join(' ')
    }
}
