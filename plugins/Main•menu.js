import fs from 'fs'
import axios from 'axios'
import { exec } from 'child_process'
import { tmpdir } from 'os'
import path from 'path'
import pkg from '@adiwajshing/baileys'
const { prepareWAMessageMedia } = pkg

async function videoToAudio(url) {
  let videoPath = path.join(tmpdir(), `menu_${Date.now()}.mp4`)
  let audioPath = path.join(tmpdir(), `menu_${Date.now()}.ogg`)
  let res = await axios.get(url, { responseType: 'arraybuffer' })
  fs.writeFileSync(videoPath, res.data)
  await new Promise((resolve, reject) => {
    exec(`ffmpeg -i "${videoPath}" -vn -ac 1 -ar 48000 -f ogg "${audioPath}"`,
      err => (err ? reject(err) : resolve()))
  })
  fs.unlinkSync(videoPath)
  return audioPath
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    let user = global.db.data.users[m.sender]
    if (!user.menuMode) user.menuMode = 'list'
    let name = await conn.getName(m.sender)

    // اختيار صورة عشوائية من المتغير global.yaemo
    let imgList = Object.values(global.yaemo || {})
    let randomImg = imgList.length ? imgList[Math.floor(Math.random() * imgList.length)] : 'https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori9.jpg'

    // جمع الأقسام والأوامر
    let tags = {}
    let helpData = Object.values(global.plugins)
      .filter(p => p && !p.disabled)
      .map(p => {
        let pTags = Array.isArray(p.tags) ? p.tags : [p.tags]
        pTags.forEach(t => t && (tags[t] = t))
        return { tags: pTags, help: Array.isArray(p.help) ? p.help : [p.help], premium: p.premium, limit: p.limit }
      })

    tags['all'] = 'كل الأوامر'
    let selectedTag = text ? text.trim().toLowerCase() : null
    let orderedTags = ['all', ...Object.keys(tags).filter(t => t !== 'all' && t !== 'main')]

    // --- منطق الوضع العادي (NORMAL/VIDEO) ---
    if (user.menuMode === 'normal') {
      let vids = Object.values(global.vidmenu || {})
      let video = vids.length ? vids[Math.floor(Math.random() * vids.length)] : null
      
      let caption = ''
      if (selectedTag && tags[selectedTag]) {
        let output = []
        let tagList = selectedTag === 'all' ? Object.keys(tags).filter(t => t !== 'all') : [selectedTag]
        for (let tag of tagList) {
          let cmds = helpData.filter(p => p.tags.includes(tag)).flatMap(p => p.help.map(h => `✦ ${usedPrefix}${h}`))
          if (cmds.length) output.push(`╭─「 ${tags[tag].toUpperCase()} 」─╮\n${cmds.join('\n')}\n╰──────────•`)
        }
        caption = output.join('\n\n')
      } else {
        caption = `╭━━〔 🤖 𝗬𝗔𝗘𝗠𝗢𝗥𝗜 𝗠𝗘𝗡𝗨 〕━━╮\n┃ 👤 ${name}\n┃ 🧩 الأقسام : ${orderedTags.length}\n┃ ⚙️ الوضع : NORMAL\n╰━━━━━━━━━━━━━━━━━━╯\n\n📌 الأقسام:\n${orderedTags.map(t => `• ${usedPrefix}menu ${t}`).join('\n')}`
      }

      if (video) {
        await conn.sendMessage(m.chat, { video: { url: video }, caption, gifPlayback: true, contextInfo: global.rcanal.contextInfo }, { quoted: m })
        try {
          let audioPath = await videoToAudio(video)
          await conn.sendMessage(m.chat, { audio: fs.readFileSync(audioPath), mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
          fs.unlinkSync(audioPath)
        } catch (e) { console.error(e) }
        return
      }
      return m.reply(caption)
    }

    // --- منطق وضع القائمة (LIST MODE) ---
    const media = await prepareWAMessageMedia({ image: { url: randomImg } }, { upload: conn.waUploadToServer })

    let rows = orderedTags.map(tag => {
      let count = tag === 'all' ? helpData.reduce((a, p) => a + p.help.length, 0) : helpData.filter(p => p.tags.includes(tag)).reduce((a, p) => a + p.help.length, 0)
      return {
        title: tag === 'all' ? '📋 كل الأوامر' : `📌 ${tags[tag]}`,
        description: `العدد: ${count} أمر`,
        id: `${usedPrefix}menu ${tag}`
      }
    })

    let bodyText = 'yaemori MD في خدمتكم دائما وابدا\n\nاضغط على الزر أدناه لتصفح الأقسام أو تبديل وضع القائمة.'
    let headerTitle = `أهلاً بك يا ${name}`

    if (selectedTag && tags[selectedTag]) {
      headerTitle = `قسم: ${tags[selectedTag]}`
      let output = []
      let tagList = selectedTag === 'all' ? Object.keys(tags).filter(t => t !== 'all') : [selectedTag]
      for (let tag of tagList) {
        let cmds = helpData.filter(p => p.tags.includes(tag)).flatMap(p => p.help.map(h => `✦ ${usedPrefix}${h}${p.premium ? ' Ⓟ' : ''}${p.limit ? ' Ⓛ' : ''}`))
        if (cmds.length) output.push(`╭─「 ${tags[tag].toUpperCase()} 」─╮\n${cmds.join('\n')}\n╰──────────•`)
      }
      bodyText = output.join('\n\n')
    }

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: headerTitle,
              hasMediaAttachment: true,
              imageMessage: media.imageMessage
            },
            body: { text: bodyText },
            footer: { text: '> 𝔟𝔶 𝔞𝔩𝔦_𝔩𝔦𝔤𝔥𝔱' },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: ' قائمة الأقسام',
                    sections: [{ title: 'الأقسام المتوفرة', rows }]
                  })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: ' تبديل المنيو',
                    id: `${usedPrefix}temp gif`
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: ' قناة البوت',
                    url: 'https://whatsapp.com/channel/0029VbBq99KBlHpjaWQsPF2J'
                  })
                }
              ]
            }
          }
        }
      }
    }

    await conn.relayMessage(m.chat, msg, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ حدث خطأ أثناء عرض المنيو')
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'قائمة', 'اوامر']
handler.register = true
export default handler