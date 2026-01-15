import axios from "axios";
import cheerio from "cheerio";
import qs from "qs";

// 1. تعريف الـ Regex الخاص بروابط إنستغرام
const instagramRegex = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv|stories)\/([^/?#&]+)/gi;

export async function before(m, { conn }) {
    // التحقق من وجود نص ومنع البوت من الرد على نفسه أو الأوامر المباشرة
    if (!m.text || m.isBaileys || m.fromMe) return true;
    if (/^[.>#!]/.test(m.text)) return true;

    // جلب إعدادات المجموعة والمستخدم من قاعدة البيانات
    let chat = global.db.data.chats[m.chat] || {};
    let user = global.db.data.users[m.sender] || {};

    // 2. التحقق من التفعيل (المنطق الذي طلبته)
    // سيعمل الكود إذا تحقق أي من الشرطين في المجموعة أو لدى المستخدم
    let isAutoDl = chat.autodownload || user.autodownload;
    let isInstaDl = chat.instadl || user.instadl;

    if (!isAutoDl && !isInstaDl) return true;

    // 3. البحث عن الروابط في النص
    let matches = m.text.match(instagramRegex);
    if (!matches) return true;

    for (const url of matches) {
        try {
            await m.react('⏳');

            const result = await Instagram(url);
            if (!result.url || result.url.length === 0) continue;

            const mediaUrls = result.url;
            const metadata = result.metadata || {};

            // تنسيق رسالة الشرح (Caption)
            const caption = `*乂 I N S T A G R A M - A U T O*\n\n` +
                (metadata.caption ? `*◦ Title:* ${metadata.caption}\n` : '') +
                (metadata.username ? `*◦ Author:* ${metadata.username}\n` : '') +
                `*◦ Type:* ${metadata.isVideo ? "Video" : "Photo"}\n` +
                (metadata.like ? `*◦ Likes:* ${formatShortNumber(metadata.like)}\n` : '') +
                (metadata.comment ? `*◦ Comments:* ${formatShortNumber(metadata.comment)}` : '').trim();

            for (const mediaUrl of mediaUrls) {
                await conn.sendFile(m.chat, mediaUrl, "instagram.mp4", caption, m);
            }
            
            await m.react('✅');
        } catch (error) {
            console.error("Auto Instagram Error:", error);
            await m.react('❌');
        }
    }
    return true;
}

// --- المحرك الرئيسي للتحميل (يجمع بين الطريقتين) ---

async function Instagram(url) {
    let result = "";
    try {
        result = await ig(url); // المحاولة الأولى: GraphQL
    } catch (e) {
        try {
            result = await getDownloadLinks(url); // المحاولة الثانية: SnapSave
        } catch (e) {
            result = { msg: "Try again later", url: [] };
        }
    }
    return result;
}

// --- الطريقة الأولى: Instagram GraphQL API ---

async function ig(url) {
    const postId = getInstagramPostId(url);
    if (!postId) throw new Error("Invalid Instagram URL");
    
    const encodedData = qs.stringify({
        lsd: "AVqbxe3J_YA",
        variables: JSON.stringify({ shortcode: postId, has_threaded_comments: false }),
        doc_id: "10015901848480474",
    });

    const response = await axios.post("https://www.instagram.com/api/graphql", encodedData, { 
        headers: {
            "X-IG-App-ID": "1217981644879628",
            "User-Agent": "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
        }
    });

    const mediaData = response.data.data?.xdt_shortcode_media;
    if (!mediaData) throw new Error("No media data");

    const getUrlFromData = (data) => {
        if (data.edge_sidecar_to_children) {
            return data.edge_sidecar_to_children.edges.map((edge) => edge.node.video_url || edge.node.display_url);
        }
        return data.video_url ? [data.video_url] : [data.display_url];
    };

    return {
        url: getUrlFromData(mediaData),
        metadata: {
            caption: mediaData.edge_media_to_caption?.edges[0]?.node?.text || null,
            username: mediaData.owner?.username,
            like: mediaData.edge_media_preview_like?.count,
            comment: mediaData.edge_media_to_comment?.count,
            isVideo: mediaData.is_video,
        }
    };
}

function getInstagramPostId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|tv|stories|reel)\/([^/?#&]+).*/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// --- الطريقة الثانية: SnapSave Scraper ---

const getDownloadLinks = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post("https://snapsave.app/action.php?lang=id", "url=" + url, {
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    "origin": "https://snapsave.app",
                    "referer": "https://snapsave.app/id",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
                }
            });

            const data = response.data;
            const videoPageContent = getVideoUrl(data);
            const $ = cheerio.load(videoPageContent);
            const downloadLinks = [];

            $("div.download-items__btn").each((index, button) => {
                let downloadUrl = $(button).find("a").attr("href");
                if (!/https?:\/\//.test(downloadUrl || "")) downloadUrl = "https://snapsave.app" + downloadUrl;
                downloadLinks.push(downloadUrl);
            });

            if (!downloadLinks.length) return reject({ msg: "No data found" });
            resolve({ url: downloadLinks, metadata: { isVideo: videoPageContent.includes('video') } });
        } catch (error) { reject({ msg: error.message }); }
    });
};

function getVideoUrl(data) {
    try {
        const params = data.split("decodeURIComponent(escape(r))}(")[1].split("))")[0].split(",").map(item => item.replace(/"/g, "").trim());
        const decoded = decodeData(params);
        return decoded.split("getElementById(\"download-section\").innerHTML = \"")[1].split("\"; document.getElementById(\"inputData\").remove(); ")[0].replace(/\\(\\)?/g, "");
    } catch (e) { return ""; }
}

function decodeData(data) {
    let [part1, part2, part3, part4, part5, part6] = data;
    part6 = "";
    for (let i = 0, len = part1.length; i < len; i++) {
        let segment = "";
        while (part1[i] !== part3[part5]) { segment += part1[i]; i++; }
        for (let j = 0; j < part3.length; j++) segment = segment.replace(new RegExp(part3[j], "g"), j.toString());
        part6 += String.fromCharCode(parseInt(segment, part5) - part4);
    }
    return decodeURIComponent(encodeURIComponent(part6));
}

function formatShortNumber(number) {
    if (!number) return "0";
    if (number >= 1e6) return (number / 1e6).toFixed(1) + "M";
    if (number >= 1e3) return (number / 1e3).toFixed(1) + "K";
    return number.toString();
}
