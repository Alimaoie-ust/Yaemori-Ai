import axios from "axios";
import cheerio from "cheerio";

async function yt5sIo(url) {
    try {
        const form = new URLSearchParams();
        form.append("q", url);
        form.append("vt", "home");

        const response = await axios.post('https://yt5s.io/api/ajaxSearch', form, {
            headers: {
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (response.data.status === "ok") {
            const $ = cheerio.load(response.data.data);

            if (/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i.test(url)) {
                const videoQualities = [];
                $('table tbody tr').each((index, element) => {
                    const quality = $(element).find('.video-quality').text().trim();
                    const downloadLink = $(element).find('a.download-link-fb').attr("href");
                    if (quality && downloadLink) {
                        videoQualities.push({ quality, downloadLink });
                    }
                });

                if (videoQualities.length === 0) {
                    throw new Error("لم يتم العثور على فيديو قابل للتحميل.");
                }

                let videoUrl = videoQualities.find(v => v.quality.toLowerCase().includes("hd"))?.downloadLink ||
                               videoQualities.find(v => v.quality.toLowerCase().includes("sd"))?.downloadLink;

                if (!videoUrl) {
                    throw new Error("لم يتم العثور على فيديو بجودة HD أو SD.");
                }

                return { videoUrl };
            } else if (/^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel)\/.+/i.test(url)) {
                const videoUrl = $('a[title="Download Video"]').attr("href");

                if (!videoUrl) {
                    throw new Error("لم يتم العثور على الفيديو.");
                }

                return { videoUrl };
            } else {
                throw new Error("الرابط غير مدعوم، يرجى إدخال رابط Facebook أو Instagram.");
            }
        } else {
            throw new Error("فشل في جلب الفيديو: " + response.data.message);
        }
    } catch (error) {
        throw error;
    }
}

let handler = async (m, { conn, text }) => {
    // تم استبدال m.reply بـ conn.reply لإضافة rcanal
    if (!text) return conn.reply(m.chat, "❌ يرجى إدخال رابط فيديو من Facebook أو Instagram.", m, global.rcanal);

    try {
        let result = await yt5sIo(text);
        if (result.videoUrl) {
            // إضافة rcanal داخل contextInfo لإرسال الفيديو
            await conn.sendMessage(m.chat, { 
                video: { url: result.videoUrl }, 
                caption: "✅ تم التحميل بنجاح!",
                contextInfo: global.rcanal.contextInfo 
            }, { quoted: m });
        } else {
            await conn.reply(m.chat, "❌ لم يتم العثور على فيديو صالح للتحميل.", m, global.rcanal);
        }
    } catch (error) {
        await conn.reply(m.chat, "❌ حدث خطأ: " + error.message, m, global.rcanal);
    }
};

handler.help = ['fb-ig']
handler.arabic = ['فيستا']
handler.command = ['fb-ig','فيستا'];
handler.tags = ['downloader'];

export default handler;
