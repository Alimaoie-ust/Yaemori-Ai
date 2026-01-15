/*
أنصح بعدم استخدام هذا الكود على واتساب المعدل
*/

import fetch from 'node-fetch'
/**
 * @type {import('@adiwajshing/baileys')}
 */
const { getBinaryNodeChild, getBinaryNodeChildren } = (await import('@adiwajshing/baileys')).default
let handler = async (m, { conn, text, participants }) => {
    // التحقق من أن المستخدم أدخل رقماً
    if (!text) {
        return m.reply('❌ يرجى إدخال رقم أو أكثر بعد الأمر "اضف" مثال: اضف 2126xxxxxxx')
    }

    let _participants = participants.map(user => user.id)
    let users = (await Promise.all(
        text.split(',')
            .map(v => v.replace(/[^0-9]/g, ''))
            .filter(v => v.length > 4 && v.length < 20 && !_participants.includes(v + '@s.whatsapp.net'))
            .map(async v => [
                v,
                await conn.onWhatsApp(v + '@s.whatsapp.net')
            ])
    )).filter(v => v[1][0]?.exists).map(v => v[0] + '@c.us')

    // التحقق من صحة الأرقام المدخلة
    if (users.length === 0) {
        return m.reply('❌ لا يوجد أرقام صحيحة أو الأرقام التي أدخلتها موجودة بالفعل في المجموعة.')
    }

    const response = await conn.query({
        tag: 'iq',
        attrs: {
            type: 'set',
            xmlns: 'w:g2',
            to: m.chat,
        },
        content: users.map(jid => ({
            tag: 'add',
            attrs: {},
            content: [{ tag: 'participant', attrs: { jid } }]
        }))
    })
    const pp = await conn.profilePictureUrl(m.chat).catch(_ => null)
    const jpegThumbnail = pp ? await (await fetch(pp)).buffer() : Buffer.alloc(0)
    const add = getBinaryNodeChild(response, 'add')
    const participant = getBinaryNodeChildren(add, 'participant')
    for (const user of participant.filter(item => item.attrs.error == 403)) {
        const jid = user.attrs.jid
        const content = getBinaryNodeChild(user, 'add_request')
        const invite_code = content.attrs.code
        const invite_code_exp = content.attrs.expiration
        let teks = `✳️ المستخدم @${jid.split('@')[0]} يمكن إضافته فقط من خلال رابط الدعوة`
        m.reply(teks, null, {
            mentions: conn.parseMention(teks)
        })
        //await conn.sendGroupV4Invite(m.chat, jid, invite_code, invite_code_exp, await conn.getName(m.chat), 'دعوة للانضمام إلى مجموعتي على واتساب', jpegThumbnail)
    }
}

handler.help = ['add <212621xxx>']
handler.arabic = ['اضف','ضف']
handler.tags = ['group']
handler.command = ['ضف','اضف','add']
handler.admin = true
handler.group = true
handler.rowner = false
handler.botAdmin = true

export default handler