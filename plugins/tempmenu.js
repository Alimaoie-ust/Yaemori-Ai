let handler = async (m, { text }) => {
  let user = global.db.data.users[m.sender]
  user.menuMode = user.menuMode === 'list' ? 'normal' : 'list'

  m.reply(
    `✅ تم تغيير المنيو إلى:\n${user.menuMode === 'list' ? '📋 LIST MENU' : '🎨 MENU عادي'}`
  )
}

handler.help = ['tempmenu']
handler.arabic = ['تيمب-منيو']
handler.tags = ['main']
handler.command = ['tempmenu','تيمب-منيو']
handler.register = true

export default handler