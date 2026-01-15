import axios from 'axios'

// Regex لاكتشاف روابط Pinterest بمختلف صيغها
const pinterestRegex = /https?:\/\/(www\.)?(pinterest\.com\/pin\/|pin\.it)\/[^\s]+/gi;

export async function before(m, { conn }) {
    // 1. الفلاتر الأساسية (تجنب البوتات، الأوامر، والرسائل الفارغة)
    if (!m.text || m.isBaileys || m.fromMe || /^[.>#!]/.test(m.text)) return true;

    let chat = global.db.data.chats[m.chat] || {};
    let user = global.db.data.users[m.sender] || {};

    // 2. التحقق من التفعيل: (autodownload + pint) أو (pint) وحده
    let isPintEnabled = (chat.autodownload && chat.pint) || (user.autodownload && user.pint) || chat.pint || user.pint;
    if (!isPintEnabled) return true;

    // 3. البحث عن الروابط في النص
    let matches = m.text.match(pinterestRegex);
    if (!matches) return true;

    for (const url of matches) {
        try {
            await m.react('⏳');

            const result = await downloadPin(url);
            
            if (!result || !result.status) {
                await m.react('❌');
                continue;
            }

            // إرسال النتيجة (فيديو أو صورة) مع دعم rcanal الخاص بك
            const commonOptions = { 
                caption: `✅ *Pinterest Auto Download*`,
                quoted: m,
                contextInfo: global.rcanal?.contextInfo || {}
            };

            if (result.type === 'video') {
                await conn.sendMessage(m.chat, { video: { url: result.url }, ...commonOptions }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { image: { url: result.url }, ...commonOptions }, { quoted: m });
            }

            await m.react('✅');

        } catch (e) {
            console.error("Pinterest Auto Error:", e);
            await m.react('❌');
        }
    }
    return true;
}

// --- محرك الاستخراج الخاص بك ---
async function downloadPin(url) {
  try {
    const res = await axios.post('https://www.expertsphp.com/download.php', 
    new URLSearchParams({ 'url': url }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      }
    })

    const html = res.data
    
    // محاولة استخراج الفيديو
    const videoMatch = html.match(/(https:\/\/v1\.pinimg\.com\/videos\/[^"']+\.mp4)/) ||
                       html.match(/(https:\/\/.*\.mp4)/)
    
    if (videoMatch) {
      return { status: true, type: 'video', url: videoMatch[1] }
    }

    // محاولة استخراج الصورة
    const imageMatch = html.match(/(https:\/\/i\.pinimg\.com\/originals\/[^"']+\.(jpg|png|gif))/ ) ||
                       html.match(/(https:\/\/i\.pinimg\.com\/736x\/[^"']+\.(jpg|png|gif))/)

    if (imageMatch) {
      return { status: true, type: 'image', url: imageMatch[1] }
    }

    return { status: false }
  } catch (e) {
    return { status: false }
  }
}