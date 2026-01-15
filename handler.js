import {generateWAMessageFromContent} from '@adiwajshing/baileys';
import {smsg} from './lib/simple.js';
import {format} from 'util';
import {fileURLToPath} from 'url';
import path, {join} from 'path';
import {unwatchFile, watchFile} from 'fs';
import fs from 'fs';
import chalk from 'chalk';
import ws from 'ws';

const { proto } = (await import('@adiwajshing/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate)
return
    this.pushMessage(chatUpdate.messages).catch(console.error)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m)
return;
if (global.db.data == null)
await global.loadDatabase()       
try {
m = smsg(this, m) || m

const isChannel = m.chat?.endsWith('@newsletter')
const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'
const isROwner = [...global.owner.map(([number]) => number)]
  .map(v => v.replace(/[^0-9]/g, "") + detectwhat)
  .includes(m.sender)

const isOwner = isROwner || m.fromMe
if (!m.isGroup && global.db.data?.settings?.[this.user.jid]?.antiprivate && !isOwner) return
const isPrems = isROwner || global.db.data.users[m.sender]?.premiumTime > 0
// قراءة ضغط الزر
// قراءة كل أنواع ضغط الأزرار
if (m.message?.buttonsResponseMessage) {
    m.text = m.message.buttonsResponseMessage.selectedButtonId;
}

if (m.message?.listResponseMessage) {
    m.text = m.message.listResponseMessage.singleSelectReply.selectedRowId;
}

if (m.message?.templateButtonReplyMessage) {
    m.text = m.message.templateButtonReplyMessage.selectedId;
}

if (m.message?.interactiveResponseMessage?.buttonReplyMsg) {
    m.text = m.message.interactiveResponseMessage.buttonReplyMsg.selectedButtonId;
}
if (!m)
return
global.mconn = m 
m.exp = 0
m.chocolates = false
try {
let user = global.db.data.users[m.sender]
//if (typeof user !== 'object')
if (typeof user !== 'object')
global.db.data.users[m.sender] = {}
if (user) {
if (!isNumber(user.exp)) user.exp = 0
if (!('premium' in user)) user.premium = false
if (!('muto' in user)) user.muto = false
if (!isNumber(user.joincount)) user.joincount = 1
if (!isNumber(user.money)) user.money = 150
if (!isNumber(user.chocolates)) user.chocolates = 10
if (!('registered' in user)) user.registered = false
if (!('menuMode' in user)) user.menuMode = 'list' 
if (!('langmenu' in user)) user.langmenu = 'en'
if (!('autodownload' in user)) user.autodownload = false
if (!('instadl' in user)) user.instadl = false
if (!('ytdl' in user)) user.ytdl = false
if (!('mp3dl' in user)) user.mp3dl = false
if (!('tikdl' in user)) user.tikdl = false
if (!('pint' in user)) user.pint = false
if (!('fbv' in user)) user.fbv = false
if (!('fb3' in user)) user.fb3 = false
if (!user.registered) {
if (!('name' in user)) user.name = m.name
if (!('age' in user)) user.age = 0
if (!isNumber(user.regTime)) user.regTime = -1
}

if (!isNumber(user.afk)) user.afk = -1
if (!('role' in user)) user.role = 'Nuv'
if (!isNumber(user.bank)) user.bank = 0
if (!isNumber(user.coin)) user.coin = 0
if (!isNumber(user.diamond)) user.diamond = 3
if (!isNumber(user.exp)) user.exp = 0
if (!isNumber(user.lastadventure)) user.lastadventure = 0
if (!isNumber(user.lastcoins)) user.lastcoins = 0    
if (!isNumber(user.lastclaim)) user.lastclaim = 0
if (!isNumber(user.lastcode)) user.lastcode = 0
if (!isNumber(user.lastcofre)) user.lastcofre = 0
if (!isNumber(user.lastcodereg)) user.lastcodereg = 0
if (!isNumber(user.lastdiamantes)) user.lastdiamantes = 0    
if (!isNumber(user.lastduel)) user.lastduel = 0
if (!isNumber(user.crime)) user.crime = 0
if (!isNumber(user.lastmining)) user.lastmining = 0
if (!isNumber(user.lastpago)) user.lastpago = 0 
if (!isNumber(user.level)) user.level = 0
if (!isNumber(user.warn)) user.warn = 0
if (!user.premium) user.premiumTime = 0
} else
global.db.data.users[m.sender] = {
afk: -1,
afkReason: '',
name: m.name,
age: 0,
bank: 0,
banned: false,
BannedReason: '',
Banneduser: false,
coin: 0,
diamond: 3,
joincount: 1,
lastadventure: 0,
lastcoins: 0,
lastclaim: 0,
lastcode: 0,
lastcofre: 0,
lastdiamantes: 0,
lastduel: 0,
lastpago: 0,
lastrob: 0,
level: 0,
chocolates: 10,
money: 100,
muto: false,
langmenu: 'en',
premium: false,
premiumTime: 0,
registered: false,
regTime: -1,
rendang: 0, 
}
let chat = global.db.data.chats[m.chat]
if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
if (chat) {
    if (!('isBanned' in chat)) 
    chat.isBanned = false        
     
    if (!('welcome' in chat)) 
    chat.welcome = true      
    
    if (!('detect' in chat)) 
    chat.detect = true         
     
    if (!('onlyarabs' in chat))
    chat.onlyarabs = false 
              
    if (!('sWelcome' in chat)) 
    chat.sWelcome = ''   
           
    if (!('sBye' in chat)) 
    chat.sBye = ''          
              
    if (!('nsfw' in chat)) 
    chat.nsfw = false        
                
    if (!('antiLink' in chat)) 
    chat.antiLink = false    
    
    if (!('antiviewonce' in chat)) 
    chat.antiviewonce = false
    
    if (!('adminmode' in chat)) 
    chat.adminmode = false    
    
    if (!('antibot' in chat)) 
    chat.antibot = false
    
    if (!('antifake' in chat)) 
    chat.antifake = false
    
    if (!('antidelete' in chat)) 
    chat.antidelete = false
    
    if (!('reaction' in chat)) 
    chat.reaction = false
    
    if (!('audios' in chat)) 
    chat.audios = false
    
    if (!('simi' in chat)) 
    chat.simi = false
    
    if (!('langmenu' in chat)) 
    chat.langmenu = 'en'
    
    if (!('autodownload' in chat)) 
    chat.autodownload = false
    
    if (!('instadl' in chat)) chat.instadl = false
    if (!('ytdl' in chat)) chat.ytdl = false
    if (!('mp3dl' in chat)) chat.mp3dl = false
    if (!('tikdl' in chat)) chat.tikdl = false
    if (!('pint' in chat)) chat.pint = false
    if (!('fbv' in chat)) chat.fbv = false
    if (!('fb3' in chat)) chat.fb3 = false
    if (!isNumber(chat.expired)) chat.expired = 0
} else global.db.data.chats[m.chat] = {
    isBanned: false,
    welcome: true,
    detect: true,
    onlyarabs: false,
    sWelcome: '',
    sBye: '',
    nsfw: false,
    antiLink: false,
    antiviewonce: false,
    adminmode: false,
    antibot: false,
    antifake: false,
    antidelete: false,
    reaction: false,
    langmenu: 'en',
    autodownload: false,
    instadl: false,
    ytdl: false,
    mp3dl: false,
    tikdl: false,
    pint: false,
    fbv: false,
    fb3: false,
    audios: false,
    simi: false,
    expired: 0,
}
let settings = global.db.data.settings[this.user.jid]
if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
if (settings) {
    if (!('self' in settings)) settings.self = false
    if (!('autoread' in settings)) settings.autoread = false
    if (!('restrict' in settings)) settings.restrict = false
    if (!('jadibotmd' in settings)) settings.jadibotmd = false  
    if (!('botcommandCount' in settings)) settings.botcommandCount = 0
    if (!('channel' in settings)) settings.channel = false
    if (!('Dfailvoice' in settings)) settings.Dfailvoice = false
    if (!('Dfailtext' in settings)) settings.Dfailtext = true
    if (!('airesp' in settings)) settings.airesp = false
    if (!('antiprivate' in settings)) settings.antiprivate = false
    if (!('antispam' in settings)) settings.antispam = false
    if (!('autobio' in settings)) settings.autobio = false
    if (!('langmenu' in settings)) settings.langmenu = 'en'
    if (!('autodownload' in settings)) settings.autodownload = false
    if (!('instadl' in settings)) settings.instadl = false
    if (!('ytdl' in settings)) settings.ytdl = false
    if (!('mp3dl' in settings)) settings.mp3dl = false
    if (!('tikdl' in settings)) settings.tikdl = false
    if (!('pint' in settings)) settings.pint = false
    if (!('fbv' in settings)) settings.fbv = false
    if (!('fb3' in settings)) settings.fb3 = false
} else global.db.data.settings[this.user.jid] = {
    self: false,
    autoread: false,
    restrict: false, 
    jadibotmd: true,
    botcommandCount: 0,
    channel: false,
    antiprivate: false,
    antispam: false,
    autobio: false,
    langmenu: 'en',
    autodownload: false,
    instadl: false,
    ytdl: false,
    mp3dl: false,
    tikdl: false,
    pint: false,
    fbv: false,
    fb3: false,
    Dfailvoice: false,
    Dfailtext: true
}
} catch (e) {
    console.error(e)
}


                if (typeof m.text !== "string")
            m.text = ""
// ===== Reply Menu Detector =====
if (
  m.quoted &&
  m.quoted.text &&
  m.quoted.text.includes('📂 أقسام البوت') &&
  /^[0-9]+$/.test(m.text)
) {
  m.isReplyMenu = true
  m.replyMenuIndex = parseInt(m.text)
}
if (
    isChannel &&
    !global.db.data?.settings?.[this.user.jid]?.channel &&
    !isROwner
)
 {
    return
}
        const chat = global.db.data.chats[m.chat]
        globalThis.setting = global.db.data?.settings?.[this.user.jid] || {}
        
        if (opts["queque"] && m.text && !(isMods)) {
            const queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }
        // if (m.id.startsWith('EVO') || m.id.startsWith('Lyru-') ||m.id.startsWith('EvoGlobalBot-') || (m.id.startsWith('BAE5') && m.id.length === 16) ||m.id.startsWith('B24E') || (m.id.startsWith('8SCO') && m.id.length === 20) ||m.id.startsWith('FizzxyTheGreat-')) return
        if (m.isBaileys) {
            return
        }
        m.exp += Math.ceil(Math.random() * 10)
        let usedPrefix
let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

async function getLidFromJid(id, conn) {
  if (id.endsWith('@lid')) return id
  const res = await conn.onWhatsApp(id).catch(() => [])
  return res[0]?.lid || id
}

const senderLid = await getLidFromJid(m.sender, conn)
const botLid = await getLidFromJid(conn.user.jid, conn)
const senderJid = m.sender
const botJid = conn.user.jid

const groupMetadata = m.isGroup
  ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null))
  : {}

const participants = m.isGroup ? (groupMetadata.participants || []) : []

const user = participants.find(
  p => p.id === senderLid || p.id === senderJid
) || {}

const bot = participants.find(
  p => p.id === botLid || p.id === botJid
) || {}

const isRAdmin = user?.admin === "superadmin"
const isAdmin = isRAdmin || user?.admin === "admin"
const isBotAdmin = !!bot?.admin

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
for (let name in global.plugins) {
let plugin = global.plugins[name]
if (!plugin)
continue
if (plugin.disabled)
continue
const __filename = join(___dirname, name)
// if (m.sender === this.user.jid) {
// continue
// }
if (typeof plugin.all === 'function') {
if (
    isChannel &&
    !global.db.data?.settings?.[this.user.jid]?.channel
) continue
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename
})
} catch (e) {
// if (typeof e === 'string') continue
console.error(e)
/*for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
let data = (await conn.onWhatsApp(jid))[0] || {}
if (data.exists)
m.reply(`⧋〘📕 FORMATO ERRONEO 📕〙⧋\n\n❒ 𝗘𝗥𝗥𝗢𝗥:\n\`\`\`${format(e)}\`\`\`\n`.trim(), data.jid)
}*/
}}
if (!opts['restrict'])
if (plugin.tags && plugin.tags.includes('admin')) {
// global.dfail('restrict', m, this)
continue
}
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
let match = (_prefix instanceof RegExp ? // RegExp Mode?
[[_prefix.exec(m.text), _prefix]] :
Array.isArray(_prefix) ? // Array?
_prefix.map(p => {
let re = p instanceof RegExp ? // RegExp in Array?
p :
new RegExp(str2Regex(p))
return [re.exec(m.text), re]
}) :
typeof _prefix === 'string' ? // String?
[[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
[[[], new RegExp]]
).find(p => p[1])
if (typeof plugin.before === 'function') {
if (await plugin.before.call(this, m, {
match,
conn: this,
participants,
groupMetadata,
user,
bot,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename
}))
continue
}
if (typeof plugin !== 'function')
continue
if ((usedPrefix = (match[0] || '')[0])) {
let noPrefix = m.text.replace(usedPrefix, '')
let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
args = args || []
let _args = noPrefix.trim().split` `.slice(1)
let text = _args.join` `
command = (command || '').toLowerCase()
let fail = plugin.fail || global.dfail // When failed
let isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
plugin.command.test(command) :
Array.isArray(plugin.command) ? // Array?
plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
cmd.test(command) :
cmd === command
) :
typeof plugin.command === 'string' ? // String?
plugin.command === command :
false

if (!isAccept) {
continue
}

if (global.db.data?.settings?.[mconn.conn.user.jid]) {
    global.db.data.settings[mconn.conn.user.jid].botcommandCount += 1
}

m.plugin = name
if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
if (!['owner-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return // Except this
if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && chat?.isBanned && !isROwner) return 
if (m.text && user.banned && !isROwner) {
m.reply(`🚫 Está baneado(a), no puede usar los comandos de este bot!\n\n${user.bannedReason ? `\n💌 *Motivo:* 
${user.bannedReason}` : '💌 *Motivo:* Sin Especificar'}\n\n⚠️ *Si este bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puede exponer su caso en:*\n\n🤍 ${asistencia}`)        
return
}

if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return

if (opts['nyimak']) return;
if (!isROwner && opts['self']) return;
if (opts['pconly'] && m.chat.endsWith('g.us')) return;
if (opts['gconly'] && !m.chat.endsWith('g.us')) {
const allowedInPrivateForUsers = ['serbot', 'serbot --code', 'menu', 'info'];
if (!isOwner && !allowedInPrivateForUsers.includes(command)) {
return
}}
if (opts['swonly'] && m.chat !== 'status@broadcast') return;
if (!global.db.data?.settings?.[this.user.jid]?.channel && m.chat === 'status@broadcast') {
    return
}
if (typeof m.text !== 'string') m.text = '';

        if (m.isBaileys) {
          return 
         }}

let hl = _prefix 
let adminMode = global.db.data.chats[m.chat].adminmode
let mini = `${plugins.botAdmin || plugins.admin || plugins.group || plugins || noPrefix || hl ||  m.text.slice(0, 1) == hl || plugins.command}`
if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return   
if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { //número bot owner
fail('owner', m, this)
continue
}
if (plugin.rowner && !isROwner) { 
fail('rowner', m, this)
continue
}
if (plugin.owner && !isOwner) { 
fail('owner', m, this)
continue
}
if (plugin.premium && !isPrems) { 
fail('premium', m, this)
continue
} else if (plugin.botAdmin && !isBotAdmin) { 
fail('botAdmin', m, this)
continue
} else if (plugin.admin && !isAdmin) { 
fail('admin', m, this)
continue
}
if (plugin.private && m.isGroup) {
fail('private', m, this)
continue
}
if (plugin.register == true && _user.registered == false) { 
    global.elnfail(m, this); // هنا فقط unreg
    continue;
}

m.isCommand = true
let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
if (plugin.money && global.db.data.users[m.sender].money < plugin.money * 1) {
m.reply(`No tienes suficiente Money para usar este comando. 🚩`)       
continue     
}

m.exp += xp
if (plugin.chocolates && global.db.data.users[m.sender].chocolates < plugin.chocolates * 1) {
m.reply(`No tienes suficiente chocolates para usar este comando. 🍫`) 
continue
}

if (plugin.level > _user.level) {
m.reply(`No tienes el nivel para usar este comando. 💣`)  
continue
}

let extra = {
match,
usedPrefix,
noPrefix,
_args,
args,
command,
text,
conn: this,
participants,
groupMetadata,
user,
bot,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename
}
try {
await plugin.call(this, m, extra)
m.chocolates = m.chocolates || plugin.chocolates || false
m.money = m.money || plugin.money || false
} catch (e) {
// Error occured
m.error = e
console.error(e)
if (e) {
let text = format(e)
// for (let key of Object.values(global.APIKeys))
text = text.replace(new RegExp(key, 'g'), 'Admin')
if (e.name)
m.reply(text)
}} finally {

if (typeof plugin.after === 'function') {
try {
await plugin.after.call(this, m, extra)
} catch (e) {
console.error(e)
}}
if (m.chocolates)
conn.reply(m.chat, `Utilizaste *${+m.chocolates}* 🍫`, m)
}
if (m.money)
conn.reply(m.chat, `Utilizaste *${+m.money}* 💰`, m)
break
}}} catch (e) {
console.error(e)
} finally {
if (opts['queque'] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}
//console.log(global.db.data.users[m.sender])
let user, stats = global.db.data.stats
if (m) {
if (m.sender && (user = global.db.data.users[m.sender])) {
user.exp += m.exp
user.chocolates -= m.chocolates * 1
user.money -= m.money * 1
}

let stat
if (m.plugin) {
let now = +new Date
if (m.plugin in stats) {
stat = stats[m.plugin]
if (!isNumber(stat.total))
stat.total = 1
if (!isNumber(stat.success))
stat.success = m.error != null ? 0 : 1
if (!isNumber(stat.last))
stat.last = now
if (!isNumber(stat.lastSuccess))
stat.lastSuccess = m.error != null ? 0 : now
} else
stat = stats[m.plugin] = {
total: 1,
success: m.error != null ? 0 : 1,
last: now,
lastSuccess: m.error != null ? 0 : now
}
stat.total += 1
stat.last = now
if (m.error == null) {
stat.success += 1
stat.lastSuccess = now
}}}

try {
if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
} catch (e) {
console.log(m, m.quoted, e)}
let settingsREAD = global.db.data.settings[this.user.jid] || {}  
if (global.db.data?.settings?.[this.user.jid]?.autoread || opts['autoread']) await this.readMessages([m.key])
}}

// دالة خاصة بالـ unregistered users فقط
global.elnfail = async (m, conn) => {
    const buttons = [
        {
            buttonId: ".rg",
            buttonText: { displayText: "تسجيل الدخول" },
            type: 1
        }
    ]

    await conn.sendMessage(m.chat, {
        video: { url: global.rg }, // يجب أن يكون mp4
        caption: "❌ أنت غير مسجل!\nاضغط على الزر للتسجيل.",
        gifPlayback: true,
        mimetype: 'video/mp4',
        buttons,
        headerType: 4
    }, { quoted: m })
}

global.sendListButton = async (conn, jid, title, text, footer, sections) => {
    const listMessage = {
        title: title,
        text: text,
        footer: footer,
        buttonText: "اختر من القائمة",
        sections: sections
    };

    return conn.sendMessage(jid, listMessage);
};

global.dfail = async (type, m, conn) => {
  const settings = global.db.data?.settings?.[conn.user.jid] || {}

  const textMsg = {
    rowner:   '「👑」 هذه الميزة خاصة بمنشئ البوت فقط',
    owner:    '「👑」 هذه الميزة خاصة بمطوّر البوت',
    premium:  '「🍧」 هذه الميزة لمستخدمي البريميوم فقط',
    private:  '「🍭」 هذا الأمر يعمل في الخاص فقط',
    admin:    '「👑」 هذا الأمر مخصص للمشرفين فقط',
    botAdmin: '「🚩」 يجب أن أكون مشرفًا لاستخدام هذا الأمر',
    restrict: '「💫」 هذه الميزة معطّلة حاليًا'
  }[type]

  /* 🔊 وضع الصوت + rcanal */
  if (settings.Dfailvoice && global.dfailVoices[type]) {
    try {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: global.dfailVoices[type] },
          mimetype: 'audio/mpeg',
          ptt: true,
          contextInfo: global.rcanal.contextInfo
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
    }
  }

  /* 📝 وضع النص + rcanal */
  if (settings.Dfailtext && textMsg) {
    return conn
      .reply(m.chat, textMsg, m, rcanal)
      .then(_ => m.react('✖️'))
  }
}