import axios from 'axios'

let handler = async (m, { conn, args }) => {
  const url = args[0]
  if (!url) return m.reply('📌 أرسل رابط Pinterest:\n.pin2 https://pin.it/xxxx')

  try {
    const result = await downloadPin(url)
    
    if (!result || !result.status) {
        return m.reply('❌ فشل التحميل. تأكد أن الحساب ليس خاصاً (Private).')
    }

    if (result.type === 'video') {
      await conn.sendFile(m.chat, result.url, 'video.mp4', '🎥 تم تحميل الفيديو بنجاح', m)
    } else {
      await conn.sendFile(m.chat, result.url, 'image.jpg', '🖼️ تم تحميل الصورة بنجاح', m)
    }
  } catch (e) {
    m.reply('❌ حدث خطأ غير متوقع.')
  }
}

handler.help = ['pin2']
handler.tags = ['downloader']
handler.command = ['pin2']

export default handler

async function downloadPin(url) {
  try {
    // استخدام API وسيط خارجي متخصص في بينترست (سريع جداً ومجاني)
    const res = await axios.post('https://www.expertsphp.com/download.php', 
    new URLSearchParams({ 'url': url }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      }
    })

    const html = res.data
    
    // البحث عن روابط الفيديو mp4
    const videoMatch = html.match(/(https:\/\/v1\.pinimg\.com\/videos\/[^"']+\.mp4)/) ||
                       html.match(/(https:\/\/.*\.mp4)/)
    
    if (videoMatch) {
      return {
        status: true,
        type: 'video',
        url: videoMatch[1]
      }
    }

    // البحث عن روابط الصور الأصلية
    const imageMatch = html.match(/(https:\/\/i\.pinimg\.com\/originals\/[^"']+\.(jpg|png|gif))/ ) ||
                       html.match(/(https:\/\/i\.pinimg\.com\/736x\/[^"']+\.(jpg|png|gif))/)

    if (imageMatch) {
      return {
        status: true,
        type: 'image',
        url: imageMatch[1]
      }
    }

    return { status: false }
  } catch (e) {
    return { status: false }
  }
}