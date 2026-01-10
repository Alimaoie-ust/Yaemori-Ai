let handler = async (m, { text }) => {
  let user = global.db.data.users[m.sender]
  user.menuMode = user.menuMode === 'list' ? 'normal' : 'list'

  m.reply(
    `✅ تم تغيير المنيو إلى:\n${user.menuMode === 'list' ? '📋 LIST MENU' : '🎨 MENU عادي'}`
  )
}

handler.help = ['tempmenu']
handler.tags = ['main']
handler.command = ['tempmenu']
handler.register = true

export default handler