import fs from 'fs'
import axios from 'axios'
import { exec } from 'child_process'
import { tmpdir } from 'os'
import path from 'path'
import fetch from 'node-fetch'
import PhoneValidator from '../lib/PhoneValidator.js'

const phoneValidator = new PhoneValidator()

// دالة التحويل من فيديو لصوت (طريقة المنيو التي تعمل لديك)
async function videoToAudio(url) {
  let videoPath = path.join(tmpdir(), `media_${Date.now()}.mp4`)
  let audioPath = path.join(tmpdir(), `media_${Date.now()}.ogg`)
  let res = await axios.get(url, { responseType: 'arraybuffer' })
  fs.writeFileSync(videoPath, res.data)
  await new Promise((resolve, reject) => {
    exec(`ffmpeg -i "${videoPath}" -vn -ac 1 -ar 48000 -f ogg "${audioPath}"`,
      err => (err ? reject(err) : resolve()))
  })
  fs.unlinkSync(videoPath)
  return audioPath
}

function resolveLidToJid(rawId) {
  if (!rawId) return null;
  if (rawId.endsWith('@s.whatsapp.net')) return rawId;
  if (rawId.endsWith('@lid')) {
    const lidKey = rawId.replace('@lid', '');
    const detection = phoneValidator.detectPhoneInLid(lidKey);
    if (detection.isPhone && detection.jid) return detection.jid;
    return rawId;
  }
  if (/^\d+$/.test(rawId)) return `${rawId}@s.whatsapp.net`;
  return rawId;
}

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  let chat = global.db.data.chats[m.chat];
  if (!chat || !chat.welcome) return true;

  const getMentionedJid = () => {
    return m.messageStubParameters.map(param => resolveLidToJid(param));
  };

  let who = resolveLidToJid(m.messageStubParameters[0]);
  
  // اختيار الروابط العشوائية من global
  let vidsWel = Object.values(global.yaecome || {})
  let vidsBye = Object.values(global.yaembye || {})
  let videoWel = vidsWel.length ? vidsWel[Math.floor(Math.random() * vidsWel.length)] : null
  let videoBye = vidsBye.length ? vidsBye[Math.floor(Math.random() * vidsBye.length)] : null

  // دالة الإرسال المعدلة بناءً على طلبك
  const handleAction = async (txt, vidUrl) => {
    if (!vidUrl) return;
    
    // 1. إرسال الفيديو GIF (لم يتم لمسه أبداً لضمان سلامة المنشن)
    await conn.sendMessage(m.chat, { 
      video: { url: vidUrl }, 
      caption: txt, 
      gifPlayback: true, 
      mentions: getMentionedJid() 
    }, { quoted: global.fkontak });

    // 2. معالجة وإرسال الصوت (هنا أضفت rcanal فقط)
    setTimeout(async () => {
      try {
        let audioPath = await videoToAudio(vidUrl);
        await conn.sendMessage(m.chat, { 
          audio: fs.readFileSync(audioPath), 
          mimetype: 'audio/ogg; codecs=opus', 
          ptt: true,
          contextInfo: global.rcanal.contextInfo // القناة مضافة هنا فقط
        }, { quoted: global.fkontak });
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      } catch (e) { console.error("Audio Error:", e) }
    }, 1000);
  };

  // --- الحالة 1: الترحيب (27) ---
  if (m.messageStubType === 27) {
    let wel = `┌─★ 𝓨𝓪𝓮𝓶𝓸𝓻𝓲 𝓐𝓲  🌱 \n│「 _*اوووه لــقد دخـــل عـضــو جــديـد مـرحـبا بــك*_ ☁ 」\n└┬★ 「 @${who.split('@')[0]} 」\n   │🌺  _*اهـــلا وســهـلا بــك*_\n   │🌺  ${groupMetadata.subject}\n   └───────────────┈ ⳹`
    await handleAction(wel, videoWel);
  }

  // --- الحالة 2: المغادرة (28) ---
  if (m.messageStubType === 28) {
    let bye = `┌─★ 𝓨𝓪𝓮𝓶𝓸𝓻𝓲 𝓐𝓲 🌱 \n│「 _*الـــى الــقـــاء*_ 🌸 」\n└┬★ 「 @${who.split('@')[0]} 」\n   │🌺  _*بالـتـوفـيــق*_\n   │🌺 _*للاسـف غـادر تـمــنـو لــه التــوفـيــق*_\n   └───────────────┈ ⳹`
    await handleAction(bye, videoBye);
  }

  // --- الحالة 3: الطرد (32) ---
  if (m.messageStubType === 32) {
    let kick = `┌─★ 𝓨𝓪𝓮𝓶𝓸𝓻𝓲 𝓐𝓲 🌱 \n│「 _*الـــى الــقـــاء*_ 🌸 」\n└┬★ 「 @${who.split('@')[0]} 」\n   │🌺  _*بالـتـوفـيــق*_\n   │🌺 _*بالـتـوفـيــق*_\n   │🌺 _*للاسـف غـادر تـمــنـو لــه التــوفـيــق*_\n   └───────────────┈ ⳹`
    await handleAction(kick, videoBye);
  }
}
