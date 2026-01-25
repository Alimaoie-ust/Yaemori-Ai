import { pathToFileURL } from 'url'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // التأكد من وجود البيانات في قاعدة البيانات
    let user = global.db.data.users[m.sender]
    let settings = global.db.data.settings[conn.user.jid]
    
    // جلب الخيار المدخل
    let type = (args[0] || '').toLowerCase()

    // 1. منطق المعالجة (التفعيل والتعطيل)
    if (type) {
        // خيارات المنيو (Menu Mode)
        if (type === 'list') {
            user.menuMode = 'list'
            return m.reply('✅ تم تفعيل وضع القائمة (LIST MENU)')
        }
        if (type === 'gif') {
            user.menuMode = 'normal'
            return m.reply('✅ تم تفعيل وضع الفيديو/الصور (GIF MENU)')
        }

        // خيارات الأخطاء (Template Fail) - للمطور فقط
        if (['voice', 'text'].includes(type)) {
            if (!isOwner) return global.dfail('owner', m, conn)
            if (type === 'voice') {
                settings.Dfailvoice = true
                settings.Dfailtext = false
                return m.reply('✅ تم تفعيل رسائل الأخطاء الصوتية')
            }
            if (type === 'text') {
                settings.Dfailvoice = false
                settings.Dfailtext = true
                return m.reply('✅ تم تفعيل رسائل الأخطاء النصية')
            }
        }
    }

    // 2. بناء القوائم (Rows) مع نظام الألوان (أخضر/أحمر)
    
    // قسم المنيو
    let menuRows = [
        {
            title: (user.menuMode === 'list' ? "🟢 " : "🔴 ") + "وضع القائمة (List)",
            description: "تفعيل القائمة المنسدلة الاحترافية",
            id: `${usedPrefix}${command} list`
        },
        {
            title: (user.menuMode === 'normal' ? "🟢 " : "🔴 ") + "وضع الفيديو/الصورة (Gif)",
            description: "تفعيل القائمة الكلاسيكية مع الوسائط",
            id: `${usedPrefix}${command} gif`
        }
    ]

    // قسم الأخطاء
    let failRows = [
        {
            title: (settings.Dfailvoice ? "🟢 " : "🔴 ") + "أخطاء صوتية (Voice)",
            description: "إرسال رسائل الخطأ بصوت يايموري",
            id: `${usedPrefix}${command} voice`
        },
        {
            title: (settings.Dfailtext ? "🟢 " : "🔴 ") + "أخطاء نصية (Text)",
            description: "إرسال رسائل الخطأ كنصوص عادية",
            id: `${usedPrefix}${command} text`
        }
    ]

    // 3. إرسال الرسالة التفاعلية
    const msg = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: `*⚙️ إعدادات نظام يايموري*\n\nمرحباً بك! من هنا يمكنك تخصيص مظهر القائمة ونوع تنبيهات الأخطاء بما يناسب استخدامك.` },
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
                                    title: '🛠️ تخصيص النظام',
                                    sections: [
                                        { title: '🖼️ إعدادات المنيو (Menu Mode)', rows: menuRows },
                                        { title: '⚠️ تنبيهات الأخطاء (Fail Mode)', rows: failRows }
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

handler.help = ['template']
handler.arabic = ['تخصيص']
handler.tags = ['main', 'tools']
handler.command = ['temp', 'template', 'تيمبلات', 'تخصيص'] 
handler.register = true
handler.admin = true
handler.botadmin = true

export default handler