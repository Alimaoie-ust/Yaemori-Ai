import fs from 'fs'
import axios from 'axios'
import { exec } from 'child_process'
import { tmpdir } from 'os'
import path from 'path'
import pkg from '@adiwajshing/baileys'
const { prepareWAMessageMedia } = pkg

// --- قاموس الربط والترجمة التلقائية للأقسام ---
const tagsMap = {
    'الكل': 'all',
    'الذكاء الاصطناعي': 'ai',
    'الإعدادات': 'config',
    'التحميلات': 'downloader',
    'المجموعات': 'group',
    'العاب': 'game',
    'تقمص شخصيات': 'rpg',
    'ستيكر': 'sticker',
    'المطور': 'owner',
    'التسجيل': 'register',
    'البحث': 'search',
    'الأدوات': 'tools',
    'الرئيسية': 'main'
}

// دالة لجلب الاسم العربي للعرض (أو الإنجليزي)
const getDisplayTag = (tag, isAr) => {
  if (!isAr) return tag.toUpperCase()
  const entry = Object.entries(tagsMap).find(([ar, en]) => en === tag.toLowerCase())
  return entry ? entry[0] : tag.toUpperCase()
}

// دالة لتحويل المدخلات (سواء كانت عربي أو إنجليزي) إلى الكلمة البرمجية الصحيحة
const getInternalTag = (input) => {
  if (!input) return null
  const entry = Object.entries(tagsMap).find(([ar, en]) => ar === input || en === input.toLowerCase())
  return entry ? entry[1] : input.toLowerCase()
}

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
    let dbSource = m.isGroup ? global.db.data.chats[m.chat] : global.db.data.users[m.sender]
    let lang = dbSource.langmenu || 'en'
    let isAr = lang === 'ar'
    
    let user = global.db.data.users[m.sender]
    if (!user.menuMode) user.menuMode = 'list'
    let name = await conn.getName(m.sender)

    // البادئة الذكية: .menu أو .اوامر
    let cmdPrefix = isAr ? `${usedPrefix}اوامر` : `${usedPrefix}menu`

    // معالجة النص المدخل ليفهم الأقسام بالعربي
    let selectedTag = getInternalTag(text?.trim())

    let imgList = Object.values(global.yaemo || {})
    let randomImg = imgList.length ? imgList[Math.floor(Math.random() * imgList.length)] : 'https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori9.jpg'

    let tags = {}
    let helpData = Object.values(global.plugins)
      .filter(p => {
        if (!p || p.disabled) return false
        if (isAr) return p.arabic && p.arabic.length > 0
        return p.help && p.help.length > 0
      })
      .map(p => {
        let pTags = Array.isArray(p.tags) ? p.tags : [p.tags]
        pTags.forEach(t => t && (tags[t] = t))
        let cmds = isAr ? p.arabic : p.help
        return { 
          tags: pTags, 
          help: Array.isArray(cmds) ? cmds : [cmds], 
          premium: p.premium, 
          limit: p.limit 
        }
      })

    let orderedTags = ['all', ...Object.keys(tags).filter(t => t !== 'all' && t !== 'main')]

    const strings = {
        title: isAr ? '𝗬𝗔𝗘𝗠𝗢𝗥𝗜 𝗠𝗘𝗡𝗨' : 'YAEMORI MENU',
        sections: isAr ? 'الأقسام' : 'CATEGORIES',
        mode: isAr ? 'الوضع' : 'MODE',
        body: isAr ? 'yaemori MD في خدمتكم دائما وابدا\n\nاضغط على الزر أدناه لتصفح الأقسام أو تبديل وضع القائمة.' : 'Yaemori MD at your service always.\n\nClick the button below to browse categories or switch menu mode.',
        switchBtn: isAr ? 'تبديل المظهر' : 'SWITCH MENU',
        langBtn: isAr ? 'English 🇺🇸' : 'العربية 🇲🇦',
        langCmd: isAr ? 'en' : 'ar',
        channelBtn: isAr ? 'قناة البوت' : 'BOT CHANNEL',
        header: isAr ? `أهلاً بك يا ${name}` : `Welcome ${name}`
    }

    // --- وضع الفيديو ---
    if (user.menuMode === 'normal') {
      let vids = Object.values(global.vidmenu || {})
      let video = vids.length ? vids[Math.floor(Math.random() * vids.length)] : null
      
      let caption = ''
      if (selectedTag && (selectedTag === 'all' || tags[selectedTag])) {
        let output = []
        let tagList = selectedTag === 'all' ? Object.keys(tags).filter(t => t !== 'all') : [selectedTag]
        for (let tag of tagList) {
          let cmds = helpData.filter(p => p.tags.includes(tag)).flatMap(p => p.help.map(h => `✦ ${usedPrefix}${h}`))
          if (cmds.length) output.push(`╭─「 ${getDisplayTag(tag, isAr)} 」─╮\n${cmds.join('\n')}\n╰──────────•`)
        }
        caption = output.join('\n\n')
      } else {
        caption = `╭━━〔 🤖 ${strings.title} 〕━━╮\n┃ 👤 ${name}\n┃ 🧩 ${strings.sections} : ${orderedTags.length}\n┃ 🌐 LANG: ${lang.toUpperCase()}\n┃ ⚙️ ${strings.mode} : NORMAL\n╰━━━━━━━━━━━━━━━━━━╯\n\n📌 ${strings.sections}:\n${orderedTags.map(t => `• ${cmdPrefix} ${getDisplayTag(t, isAr)}`).join('\n')}`
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

    // --- وضع القائمة ---
    const media = await prepareWAMessageMedia({ image: { url: randomImg } }, { upload: conn.waUploadToServer })

    let rows = orderedTags.map(tag => {
      let count = tag === 'all' ? helpData.reduce((a, p) => a + p.help.length, 0) : helpData.filter(p => p.tags.includes(tag)).reduce((a, p) => a + p.help.length, 0)
      return {
        title: tag === 'all' ? (isAr ? '📋 الكل' : '📋 All') : `📌 ${getDisplayTag(tag, isAr)}`,
        description: isAr ? `العدد: ${count} أمر` : `Count: ${count} commands`,
        id: `${cmdPrefix} ${getDisplayTag(tag, isAr)}`
      }
    })

    let bodyText = strings.body
    let headerTitle = strings.header

    if (selectedTag && (selectedTag === 'all' || tags[selectedTag])) {
      headerTitle = isAr ? `قسم: ${getDisplayTag(selectedTag, isAr)}` : `Category: ${getDisplayTag(selectedTag, isAr)}`
      let output = []
      let tagList = selectedTag === 'all' ? Object.keys(tags).filter(t => t !== 'all') : [selectedTag]
      for (let tag of tagList) {
        let cmds = helpData.filter(p => p.tags.includes(tag)).flatMap(p => p.help.map(h => `✦ ${usedPrefix}${h}`))
        if (cmds.length) output.push(`╭─「 ${getDisplayTag(tag, isAr)} 」─╮\n${cmds.join('\n')}\n╰──────────•`)
      }
      bodyText = output.length ? output.join('\n\n') : (isAr ? 'لا توجد أوامر مترجمة هنا.' : 'No commands here.')
    }

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: { title: headerTitle, hasMediaAttachment: true, imageMessage: media.imageMessage },
            body: { text: bodyText },
            footer: { text: '> 𝔟𝔶 𝔞𝔩𝔦_𝔩𝔦𝔤𝔥𝔱' },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: isAr ? 'قائمة الأقسام' : 'Sections List',
                    sections: [{ title: strings.sections, rows }]
                  })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: strings.switchBtn, id: `${usedPrefix}temp gif` })
                },
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: strings.langBtn, id: `${usedPrefix}setlang ${strings.langCmd}` })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({ display_text: strings.channelBtn, url: 'https://whatsapp.com/channel/0029VbBq99KBlHpjaWQsPF2J' })
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
    m.reply('❌ Error')
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'قائمة', 'اوامر']
handler.register = true
export default handler
