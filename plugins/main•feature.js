let handler = async (m, { conn }) => {
  try {
    const tags = Object.values(global.plugins)
      .flatMap(p => p.help ? p.tags : [])
      .filter(tag => tag != undefined && tag.trim() !== '');

    const counts = tags.reduce((c, tag) => {
      c[tag] = (c[tag] || 0) + 1;
      return c;
    }, {});

    const tagList = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => `▫️ ${(tag.charAt(0).toUpperCase() + tag.slice(1)).padEnd(13)} : ${count}`)
      .join('\n');

    const totalCommands = Object.values(counts).reduce((a, b) => a + b, 0);

    await conn.reply(m.chat, `*｢ قائمة ميزات بوت ناتالي ｣*\n\n${tagList}\n\n*إجمالي الأوامر المتاحة: ${totalCommands}*`, m, global.rcanal);
  } catch (error) {
    await conn.reply(m.chat, '❌ حدث خطأ أثناء جلب الميزات.', m, global.rcanal);
  }
}
handler.help = ['feature']
handler.arabic = ['ليست']
handler.tags = ['main']
handler.command = ['feature','ليست']
export default handler
