import { join } from "path";
import { existsSync, unlinkSync } from "fs";

let handler = async (m, { conn, text, usedPrefix, command, __dirname }) => {
    let allPlugins = Object.entries(plugins);
    
    // إذا لم يحدد المستخدم قسماً أو ملفاً، نعرض قائمة الأقسام (Tags)
    if (!text) {
        // جمع كل الـ tags، وإذا لم يوجد نضع 'other'
        let tagsSet = new Set();
        allPlugins.forEach(([path, module]) => {
            if (module.tags && Array.isArray(module.tags) && module.tags.length > 0) {
                module.tags.forEach(tag => tagsSet.add(tag));
            } else if (module.tags && typeof module.tags === 'string') {
                tagsSet.add(module.tags);
            } else {
                tagsSet.add('other'); // التصنيف الاحتياطي
            }
        });

        let tags = [...tagsSet].filter(v => v);
        
        let rows = tags.map(tag => ({
            title: `📁 قسم: ${tag === 'other' ? 'إضافات أخرى' : tag.toUpperCase()}`,
            description: tag === 'other' ? 'ملفات بدون تصنيف محدد' : `عرض الملفات في تصنيف ${tag}`,
            id: `${usedPrefix}${command} tag:${tag}`
        }));

        const msg = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `*🗑️ مدير حذف الإضافات الذكي*\n\nيرجى اختيار القسم المُراد فحصه:` },
                        footer: { text: 'Yaemori Bot System' },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: '📢 قناة المطور',
                                        url: 'https://whatsapp.com/channel/0029VbBq99KBlHpjaWQsPF2J'
                                    })
                                },
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: '📂 التصنيفات المتاحة',
                                        sections: [{ title: 'الأقسام', rows }]
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        };
        return await conn.relayMessage(m.chat, msg, {});
    }

    // إذا اختار المستخدم قسماً معيناً
    if (text.startsWith('tag:')) {
        let selectedTag = text.replace('tag:', '').trim();
        
        // تصفية الملفات بناءً على التاج المختار أو وضعها في 'other'
        let filteredPlugins = allPlugins.filter(([path, module]) => {
            if (selectedTag === 'other') {
                return !module.tags || (Array.isArray(module.tags) && module.tags.length === 0);
            }
            return module.tags && (Array.isArray(module.tags) ? module.tags.includes(selectedTag) : module.tags === selectedTag);
        });

        if (filteredPlugins.length === 0) return m.reply(`❌ لا توجد ملفات في هذا القسم.`);

        let rows = filteredPlugins.map(([path, module]) => {
            let fileName = path.split('/').pop();
            return {
                title: `📄 ${fileName}`,
                description: `حذف نهائي للملف من الذاكرة والتخزين`,
                id: `${usedPrefix}${command} delete:${fileName}`
            };
        });

        const msg = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `*📂 ملفات القسم: ${selectedTag}*\n\nاختر الملف الذي تود حذفه:` },
                        footer: { text: 'Yaemori Bot System' },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: '🗑️ تحديد الملف للحذف',
                                        sections: [{ title: 'قائمة الملفات', rows }]
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        };
        return await conn.relayMessage(m.chat, msg, {});
    }

    // تنفيذ الحذف الفعلي
    if (text.startsWith('delete:')) {
        let fileName = text.replace('delete:', '').trim();
        let filePath = join(__dirname, '../plugins/', fileName);

        if (!existsSync(filePath)) {
            filePath = join(__dirname, fileName); // تجربة مسار بديل
        }

        try {
            if (existsSync(filePath)) {
                unlinkSync(filePath);
                await m.react('🗑️');
                return m.reply(`✅ *تم الحذف بنجاح!*\n\nالملف: ${fileName}\n\n_ملاحظة: يايموري قامت بمسحه تماماً من ملفات البوت._`);
            } else {
                return m.reply(`❌ فشل العثور على الملف في المسار: ${fileName}`);
            }
        } catch (e) {
            console.error(e);
            return m.reply(`❌ حدث خطأ غير متوقع أثناء الحذف.`);
        }
    }
};

handler.help = ["deleteplugin"];
handler.arabic = ['حذف-ميزة', 'df'];
handler.tags = ["owner"];
handler.command = /^(deleteplugin|df|حذف-ميزة)$/i;
handler.owner = true; 

export default handler;
