import yts from "yt-search";
import axios from 'axios';
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@adiwajshing/baileys')).default;

let handler = async (m, { conn, command }) => {
    // استخراج النص المكتوب بعد كلمة البحث/الأمر يدوياً
    // يقوم بحذف كلمة الأمر من البداية وأخذ ما بعدها
    let text = m.text.replace(/^(بحث|قلبي على|قلبي)/i, "").trim();

    // إذا لم يكتب المستخدم شيئاً بعد "بحث"
    if (!text) return conn.reply(m.chat, `• *مثال الاستخدام:* بحث billie`, m, global.rcanal);

    await conn.reply(m.chat, '*_`⏳ جاري البحث في يوتيوب عن: ' + text + '...`_*', m, global.rcanal);

    async function createImage(url) {
        const { imageMessage } = await generateWAMessageContent({
            image: { url }
        }, {
            upload: conn.waUploadToServer
        });
        return imageMessage;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    let push = [];
    let results = await yts(text);
    let videos = results.videos.slice(0, 15); 
    shuffleArray(videos); 

    if (videos.length === 0) return conn.reply(m.chat, '❌ لم يتم العثور على نتائج.', m);

    let i = 1;
    for (let video of videos) {
        let imageUrl = video.thumbnail;
        push.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `🎬 *العنوان:* ${video.title}\n⌛ *المدة:* ${video.timestamp}\n👀 *المشاهدات:* ${video.views}\n🔗 *الرابط:* ${video.url}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: '乂 NATALY AI 🧠' 
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: `فيديو رقم - ${i++}`,
                hasMediaAttachment: true,
                imageMessage: await createImage(imageUrl) 
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                    {
                        "name": "cta_url",
                        "buttonParamsJson": `{"display_text":"مشاهدة على يوتيوب 📺","url":"${video.url}"}`
                    }
                ]
            })
        });
    }

    const bot = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: `✅ اكتمل البحث عن: ${text}\nاسحب لليسار لرؤية النتائج.`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: '乂 NATALY AI 🧠' 
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        hasMediaAttachment: false
                    }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                        cards: [...push] 
                    }),
                    contextInfo: global.rcanal.contextInfo
                })
            }
        }
    }, { quoted: m });

    await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
}

// التعديل لضمان العمل بدون Prefix
handler.customPrefix = /^(بحث|قلبي على|قلبي)/i; 
handler.command = new RegExp; 

handler.limit = true;

export default handler;
