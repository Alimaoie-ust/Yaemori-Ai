import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("❗️استعمل:\n*.welcome <group-jid>*");

    const groupId = text.trim(); // JID المجموعة
    const welcomeText = `*مـرحـبـاً 👋*

أنا *NATALY AI* المساعدة الذكية الخاصة بالمجموعة 🙆‍♀️  
تم تطويــري بواسطة *ALI M..*  

سأكون هنا لمساعدتكم في كل ما تحتاجونه 💫

`;

    // إعداد قائمة الخيارات بنفس هيكل menu.js
    const menus = ['قـائـمــة الاوامــر', '👤 الـمــطـــور'];
    const gc = ['تـسـجـيـل الـدخــول'];

    let isiMenu = menus.map((item) => ({
        header: item,
        title: item,
        description: item === 'قـائـمــة الاوامــر' ? "إظـهــار قـائـمــة أوامـر الـبــوت" : " صـاحــب الـبــوت",
        id: item === 'اوامــر الـبــوت' ? ".menu" : ".owner"
    }));

    let isiGrup = gc.map((item) => ({
        header: item,
        title: item,
        description: "تسجيل الدخول في قاعدة البوت",
        id: "@verify"
    }));

    const datas = {
        title: "🧩 قـائـمــة الاوامــرا",
        sections: [
            { title: "اوامــر الـبــوت", highlight_label: "New", rows: [...isiMenu] },
            { title: "قائمة الترحيب", highlight_label: "Hot", rows: [...isiGrup] }
        ]
    };

    const thumbnail = "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori8.jpg";

    try {
        await conn.sendListImageButton(
            groupId,        // JID المجموعة
            welcomeText,    // نص الترحيب
            datas,          // بيانات القائمة
            "> by ALI Maoie", // Footer / wm
            thumbnail       // الصورة
        );

        await m.reply("✅ تم إرسال الترحيب مع الصورة وقائمة الخيارات ✔");
    } catch (e) {
        console.log("WELCOME ERROR:", e);
        return m.reply("❌ فشل في إرسال الترحيب. تأكد أن البوت داخل المجموعة وأن الـJID صحيح.");
    }
};

handler.command = /^welcome$/i;
handler.rowner = true;
handler.owner = true;

export default handler;