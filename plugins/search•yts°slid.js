import yts from "yt-search";
import axios from 'axios';
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@adiwajshing/baileys')).default;

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `• *مثال:* ${usedPrefix + command} سورة الكهف`, m, global.rcanal);

    await conn.reply(m.chat, '*_`⏳ جاري البحث في يوتيوب...`_*', m, global.rcanal);

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
                        text: "✅ اكتمل البحث! اسحب لليسار لرؤية النتائج."
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
                    // إضافة القناة في الـ contextInfo للرسالة التفاعلية
                    contextInfo: global.rcanal.contextInfo
                })
            }
        }
    }, { quoted: m });

    await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
}

handler.help = ["yts2"];
handler.arabic = ['يوتيوب2']
handler.tags = ["search"];
handler.command = ['yts2','يوتيوب2'];
handler.limit = true;

export default handler;
