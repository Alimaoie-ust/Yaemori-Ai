let handler = async function (m, { conn }) {
    // إذا أتى من زر
    let command = m.buttonId || (m.message?.buttonsResponseMessage?.selectedButtonId) || m.text;

    if (!command) return;

    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};

    let user = global.db.data.users[m.sender];

    if (user.registered === true) throw `*『✦』أنت مسجل بالفعل. لإعادة التسجيل، استخدم #unreg*`;

    // اسم المستخدم من واتساب
    let name = await conn.getName(m.sender);

    // عمر عشوائي بين 13 و 40
    let age = Math.floor(Math.random() * (40 - 13 + 1)) + 13;

    // إضافة بيانات المستخدم
    user.name = name;
    user.age = age;
    user.descripcion = '😎 مستخدم واتساب';
    user.regTime = +new Date();
    user.registered = true;
    global.db.data.users[m.sender].money = (global.db.data.users[m.sender].money || 0) + 5;
    global.db.data.users[m.sender].chocolates = (global.db.data.users[m.sender].chocolates || 0) + 15;
    global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + 245;
    global.db.data.users[m.sender].joincount = (global.db.data.users[m.sender].joincount || 0) + 12;

    let regbot = `
╭─────────✨─────────╮
│  ✅ تم التسجيل بنجاح ✅
╰─────────✨─────────╯

👤 الاسم: ${name}
🎂 العمر: ${age} سنة

🎁 المكافآت:
• 15 شوكولاتة 🍫
• 5 عملات MeguCoins 🪙
• 245 خبرة 💸
• 12 توكن 💰

مرحبًا بك في البوت! 🚀
    `.trim();

    // إرسال الرسالة مع الصورة
    await conn.sendMessage(m.chat, {
        image: { url: 'https://raw.githubusercontent.com/Alismbot/NATALY/refs/heads/main/elaina.jpg' },
        caption: regbot,
        mentions: [m.sender],
        contextInfo: { quoted: global.fkontak }
    });
    m.react('📩');
};
handler.help = ['reg']
handler.arabic = ['تسجيل']
handler.tags = ['register']
handler.command = ['@verify', 'تسجيل', 'rg', 'سجلني', 'sejlni'];
export default handler;