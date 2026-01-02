import fs from 'fs';
import { xpRange } from '../lib/levelling.js';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        let user = global.db.data.users[m.sender];
        let { exp, level, role, cookies } = user;
        let { min, xp, max } = xpRange(level, global.multiplier);
        let name = await conn.getName(m.sender);

        // جمع الأقسام والأوامر من plugins
        let tags = {};
        let helpData = Object.values(global.plugins)
            .filter(p => !p.disabled)
            .map(p => {
                const pluginTags = Array.isArray(p.tags) ? p.tags : [p.tags];
                const pluginHelp = Array.isArray(p.help) ? p.help : [p.help];
                for (let tag of pluginTags) if (tag) tags[tag] = tag;
                return { tags: pluginTags, help: pluginHelp, premium: p.premium, limit: p.limit };
            });

        // إضافة قسم "كل الأوامر" دائمًا
        tags['all'] = 'كل الأوامر';

        let selectedTag = text ? text.trim() : null;

        // تحضير زر List Button للأقسام مع ترتيب: كل الأوامر أولًا
        const buildRows = () => {
            let orderedTags = ['all', ...Object.keys(tags).filter(t => t !== 'all')];
            return orderedTags.map(tag => {
                let commandsCount = tag === 'all'
                    ? helpData.reduce((acc, p) => acc + p.help.length, 0)
                    : helpData.filter(p => p.tags.includes(tag))[0]?.help.length || 0;

                return {
                    header: `قسم: ${tag}`,
                    title: tag === 'all' ? '📋 كل الأوامر' : `📌 ${tags[tag]}`,
                    description: `عدد أوامر هذا القسم: ${commandsCount}`,
                    id: `.menu ${tag}`
                };
            });
        };

        const thumb = "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori9.jpg";

        // إذا لم يتم اختيار قسم → عرض قائمة الأقسام
        if (!selectedTag) {
            const datas = {
                title: "اضغط هنا!",
                sections: [
                    { title: "الأقسام", highlight_label: "> 𝔟𝔶 𝔞𝔩𝔦_𝔩𝔦𝔤𝔥𝔱", rows: buildRows() }
                ]
            };

            return conn.sendListImageButton(
                m.chat,
                "yaemori MD في خدمتكم دائما وابدا",
                datas,
                "> 𝔟𝔶 𝔞𝔩𝔦_𝔩𝔦𝔤𝔥𝔱",
                thumb
            );
        }

        // إذا اختار المستخدم قسم موجود
        if (!tags[selectedTag]) return m.reply(`⚠️ القسم '${selectedTag}' غير موجود.`);

        // جمع الأوامر للقسم المختار مع الزخرفة
        let commandsInTag = [];
        if (selectedTag === 'all') {
            for (let tag of Object.keys(tags).filter(t => t !== 'all')) {
                let cmds = [];
                for (let plugin of helpData) {
                    if (plugin.tags.includes(tag)) {
                        cmds.push(...plugin.help.map(h => `✦ ${usedPrefix}${h}${plugin.premium ? ' Ⓟ' : ''}${plugin.limit ? ' Ⓛ' : ''}`));
                    }
                }
                if (cmds.length) {
                    commandsInTag.push(`╭─「 ${tags[tag]} 」─╮\n${cmds.join('\n')}\n╰──────────•`);
                }
            }
        } else {
            let cmds = [];
            for (let plugin of helpData) {
                if (plugin.tags.includes(selectedTag)) {
                    cmds.push(...plugin.help.map(h => `✦ ${usedPrefix}${h}${plugin.premium ? ' Ⓟ' : ''}${plugin.limit ? ' Ⓛ' : ''}`));
                }
            }
            if (cmds.length) {
                commandsInTag.push(`╭─「 ${tags[selectedTag]} 」─╮\n${cmds.join('\n')}\n╰──────────•`);
            }
        }

        const caption = commandsInTag.join('\n\n');

        // زر List Button لإعادة اختيار الأقسام
        const datas = {
            title: "اضغط هنا!",
            sections: [
                { title: "الأقسام", highlight_label: "> 𝔟𝔶 𝔞𝔩𝔦_𝔩𝔦𝔤𝔥𝔱", rows: buildRows() }
            ]
        };

        await conn.sendListImageButton(
            m.chat,
            caption,
            datas,
            "> 𝔟𝔶 𝔞𝔩𝔦_𝔩𝔦𝔤𝔥𝔱",
            thumb
        );

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, '❌ حدث خطأ أثناء عرض القائمة', m);
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'قائمة', 'اوامر'];
handler.register = true;

export default handler;