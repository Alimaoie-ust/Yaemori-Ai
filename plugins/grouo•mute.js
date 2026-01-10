import fetch from 'node-fetch';

const handler = async (m, { conn, command, text, isAdmin }) => {
    // تحديد الشخص المستهدف
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;

    if (command === 'mute' || command === 'كتم') { 
        if (!isAdmin) return conn.reply(m.chat, '⚠️ *عذراً، هذا الأمر مخصص للمشرفين فقط!*', m, global.rcanal);

        const botOwner = global.owner[0][0] + '@s.whatsapp.net';
        if (who === botOwner) return conn.reply(m.chat, '❌ *لا يمكنك كتم مطور البوت!*', m, global.rcanal);

        if (who === conn.user.jid) return conn.reply(m.chat, '🚫 *لا يمكنني كتم نفسي!*', m, global.rcanal);

        const groupMetadata = await conn.groupMetadata(m.chat);
        const groupCreator = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';

        if (who === groupCreator) return conn.reply(m.chat, '🛡️ *لا يمكن كتم منشئ المجموعة إلا من مشرف آخر.*', m, global.rcanal);

        if (!who) return conn.reply(m.chat, '👤 *يرجى منشن الشخص الذي تريد كتمه أو الرد على رسالته.*', m, global.rcanal);
        
        let user = global.db.data.users[who];
        if (user.muto === true) return conn.reply(m.chat, '📢 *هذا المستخدم مكتوم بالفعل!*', m, global.rcanal);

        // إعداد رسالة العرض (البطاقة الوهمية) مع دمج rcanal
        let fakeContact = {
            'key': { 'participants': '0@s.whatsapp.net', 'fromMe': false, 'id': 'Halo' },
            'message': {
                'locationMessage': {
                    'name': '🛑 تـم كـتـم الـمـسـتـخدم',
                    'jpegThumbnail': await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer()
                }
            },
            'participant': '0@s.whatsapp.net'
        };

        // تنفيذ عملية الكتم
        global.db.data.users[who].muto = true;
        
        // إرسال الرد مع القناة والبطاقة الوهمية
        await conn.sendMessage(m.chat, { 
            text: '✅ *تم كتم المستخدم، سيتم حذف رسائله تلقائياً.*',
            contextInfo: {
                ...global.rcanal.contextInfo,
                mentionedJid: [who]
            }
        }, { quoted: fakeContact });

    } else if (command === 'unmute' || command === 'الغاء_الكتم') { 
        if (!isAdmin) return conn.reply(m.chat, '⚠️ *هذا الأمر مخصص للمشرفين فقط!*', m, global.rcanal);

        if (!who) return conn.reply(m.chat, '👤 *يرجى منشن الشخص الذي تريد إلغاء كتمه.*', m, global.rcanal);
        
        let user = global.db.data.users[who];
        if (user.muto === false) return conn.reply(m.chat, '☁️ *هذا المستخدم ليس مكتوماً في الأصل.*', m, global.rcanal);

        let fakeContactUnmute = {
            'key': { 'participants': '0@s.whatsapp.net', 'fromMe': false, 'id': 'Halo' },
            'message': {
                'locationMessage': {
                    'name': '✅ تـم إلـغـاء الـكـتـم',
                    'jpegThumbnail': await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer()
                }
            },
            'participant': '0@s.whatsapp.net'
        };

        // إلغاء الكتم
        global.db.data.users[who].muto = false;
        
        await conn.sendMessage(m.chat, { 
            text: '🎊 *تم إلغاء الكتم، يمكنك التحدث الآن.*',
            contextInfo: {
                ...global.rcanal.contextInfo,
                mentionedJid: [who]
            }
        }, { quoted: fakeContactUnmute });
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = ['mute', 'unmute', 'كتم', 'الغاء_الكتم'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
