import axios from 'axios'
import crypto from 'crypto'

async function nanobanana(prompt, image) {
    const inst = axios.create({ baseURL: 'https://image-editor.org/api', headers: { origin: 'https://image-editor.org', 'user-agent': 'Mozilla/5.0' }})
    const { data: up } = await inst.post('/upload/presigned', { filename: `rynn.jpg`, contentType: 'image/jpeg' })
    await axios.put(up.data.uploadUrl, image)
    const { data: cf } = await axios.post('https://api.nekolabs.web.id/tools/bypass/cf-turnstile', { url: 'https://image-editor.org/editor', siteKey: '0x4AAAAAAB8ClzQTJhVDd_pU' })
    const { data: task } = await inst.post('/edit', { prompt, image_urls: [up.data.fileUrl], image_size: 'auto', turnstileToken: cf.result, uploadIds: [up.data.uploadId], userUUID: crypto.randomUUID() })
    while (true) {
        const { data } = await inst.get(`/task/${task.data.taskId}`)
        if (data?.data?.status === 'completed') return data.data.result
        await new Promise(res => setTimeout(res, 2000))
    }
}

let handler = async (m, { conn, text }) => {
    try {
        if (!text) return conn.reply(m.chat, '❗ Provide a prompt.', m, global.rcanal)
        let q = m.quoted ? m.quoted : m
        if (!/image/.test((q.msg || q).mimetype || '')) return conn.reply(m.chat, '❗ Reply to image.', m, global.rcanal)
        
        await conn.reply(m.chat, '⏳ Processing...', m, global.rcanal)
        let img = await q.download()
        let resultUrl = await nanobanana(text, img)
        await conn.sendMessage(m.chat, { image: { url: resultUrl }, caption: '✅ Done!', contextInfo: global.rcanal.contextInfo }, { quoted: m })
    } catch (e) { conn.reply(m.chat, '❌ Error: ' + e.message, m, global.rcanal) }
}
handler.help = ['edit'];
handler.arabic = ['تصميم'];
handler.command = ['edit','تصميم'];
handler.tags = ['ai'];
handler.limit = true;
export default handler;
