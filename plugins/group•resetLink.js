let handler = async (m, { conn }) => {
  let res = await conn.groupRevokeInvite(m.chat)
  m.reply(
    '✅ تم إعادة تعيين رابط المجموعة بنجاح\n\n📌 الرابط الجديد:\nhttps://chat.whatsapp.com/' + res
  )
}
handler.help = ['تغيير-الرابط']
handler.tags = ['group']
handler.command = ['revoke', 'resetlink', 'تغيير-الرابط']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler