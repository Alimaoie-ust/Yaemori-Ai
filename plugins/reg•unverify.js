import fetch from 'node-fetch';

let handler = async function (m, { conn }) {
    let user = global.db.data.users[m.sender];
    if (!user.registered) return conn.reply(m.chat, `❌ أنت غير مسجل أصلاً.`, m, global.rcanal);

    user.registered = false;
    // ... (باقي تصفير البيانات)

    let msg = `✔️ *تم حذف تسجيلك بنجاح!*`;
    
    // استخدام rcanal عند الرد
    await conn.reply(m.chat, msg, m, global.rcanal);
}
handler.help = ["unreg"];
handler.tags = ["main"];
handler.command = /^(unreg|deletesign)$/i;
export default handler;
