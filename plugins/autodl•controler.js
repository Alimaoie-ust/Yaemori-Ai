let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isROwner }) => {
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let target = (m.isGroup && (isAdmin || isROwner)) ? chat : user

    // تعريف الميزات مع إضافة pint
    const featureConfig = [
        { id: 'all_vid', name: 'الشامل (فيديو 🎬)', desc: 'autodownload + فيديو (YT & FB)' },
        { id: 'all_aud', name: 'الشامل (صوت 🎵)', desc: 'autodownload + صوت (YT & FB)' },
        { id: 'stop', name: 'إيقاف الكل 🛑', desc: 'تعطيل كافة الميزات فوراً' },
        { id: 'mp3dl', name: 'يوتيوب (صوت)', desc: 'تفعيل صوت يوتيوب منفرداً' },
        { id: 'ytdl', name: 'يوتيوب (فيديو)', desc: 'تفعيل فيديو يوتيوب منفرداً' },
        { id: 'fb3', name: 'فيسبوك (صوت)', desc: 'تفعيل صوت فيسبوك منفرداً' },
        { id: 'fbv', name: 'فيسبوك (فيديو)', desc: 'تفعيل فيديو فيسبوك منفرداً' },
        { id: 'instadl', name: 'إنستغرام', desc: 'تحميل ريلز وصور إنستا' },
        { id: 'tikdl', name: 'تيك توك', desc: 'تحميل فيديوهات تيك توك' },
        { id: 'pint', name: 'بينترست', desc: 'تحميل صور وفيديوهات Pinterest' }
    ]

    let type = (args[0] || '').toLowerCase()

    if (type) {
        // منطق إيقاف الكل (تم إضافة pint هنا)
        if (type === 'stop') {
            const keys = ['autodownload', 'ytdl', 'mp3dl', 'fbv', 'fb3', 'instadl', 'tikdl', 'pint']
            keys.forEach(k => target[k] = false)
            return m.reply('🛑 تم إيقاف جميع ميزات التحميل التلقائي.')
        }
        // منطق الشامل فيديو
        if (type === 'all_vid') {
            target.autodownload = true; target.ytdl = true; target.fbv = true
            target.mp3dl = false; target.fb3 = false
            return m.reply('✅ تم تفعيل *الوضع الشامل: فيديو* (YT & FB).')
        }
        // منطق الشامل صوت
        if (type === 'all_aud') {
            target.autodownload = true; target.mp3dl = true; target.fb3 = true
            target.ytdl = false; target.fbv = false
            return m.reply('✅ تم تفعيل *الوضع الشامل: صوت* (YT & FB).')
        }

        let feat = featureConfig.find(f => f.id === type)
        if (feat) {
            let nextState = !target[feat.id]
            if (nextState === true) {
                if (feat.id === 'mp3dl') target.ytdl = false
                if (feat.id === 'ytdl') target.mp3dl = false
                if (feat.id === 'fb3') target.fbv = false
                if (feat.id === 'fbv') target.fb3 = false
            }
            target[feat.id] = nextState
            return m.reply(`✅ تم *${nextState ? 'تفعيل' : 'تعطيل'}* ${feat.name}`)
        }
    }

    // تصنيف الصفوف للقائمة
    let mainRows = [] // للشامل والإيقاف
    let activeRows = []
    let inactiveRows = []

    featureConfig.forEach(f => {
        let isEnabled = false
        if (f.id === 'all_vid') isEnabled = (target.autodownload && target.ytdl && target.fbv)
        else if (f.id === 'all_aud') isEnabled = (target.autodownload && target.mp3dl && target.fb3)
        else if (f.id === 'stop') isEnabled = false
        else isEnabled = !!target[f.id]

        let row = {
            title: (f.id === 'stop' ? "🛑 " : (isEnabled ? "🟢 " : "🔴 ")) + f.name,
            description: f.desc,
            id: `${usedPrefix}${command} ${f.id}`
        }

        if (['all_vid', 'all_aud', 'stop'].includes(f.id)) mainRows.push(row)
        else isEnabled ? activeRows.push(row) : inactiveRows.push(row)
    })

    const msg = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: `*إعدادات التحميل التلقائي ⚙️*\n\n📍 *الوضع:* ${m.isGroup ? 'المجموعة' : 'الشخصي'}\n💡 التحكم في يوتيوب وفيسبوك والمنصات الأخرى.` },
                    footer: { text: 'Yaemori Bot System' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '📢 قناة المطور',
                                    url: 'https://whatsapp.com/channel/0029VbBq99KBlHpjaWQsPF2J'
                                })
                            },
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: '📂 خيارات التحكم',
                                    sections: [
                                        { title: '⭐ الأوضاع الرئيسية', rows: mainRows },
                                        { title: '✅ الميزات المفعلة', rows: activeRows },
                                        { title: '❌ الميزات المعطلة', rows: inactiveRows }
                                    ]
                                })
                            }
                        ]
                    }
                }
            }
        }
    }
    await conn.relayMessage(m.chat, msg, {})
}

handler.help = ["auto"]
handler.arabic = ['اوطو']
handler.tags = ['config']
handler.command = /^(auto|أوطو)$/i
export default handler
