import './lib/system/settings.js'
import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

//BETA: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
global.botNumberCode = '' //Ejemplo: +212621240657
global.confirmCode = ''

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
   ['212621240657', 'Creador 👑', true],
   ['212621240657', 'Owner 🍭', true],
   ['212621240657'],
   ['212621240657'],
   ['212621240657']
]
global.report = ['212621240657']
//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.mods = []
global.prems = []

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

//cambiar a true si el bot detecta sus propios comandos.
global.isBaileysFail = false
global.libreria = 'Baileys'
global.baileys = 'V 6.7.8'
global.vs = '2.0.7'
global.languaje = 'en'
global.nameqr = '𝔈𝔪𝔦𝔩𝔩𝔦𝔞 𝔅𝔬𝔱'
global.namebot = 'ᥡᥲᥱm᥆rі ᑲ᥆𝗍 ᰔᩚ'
global.sessions = 'MiniSession'
global.jadi = 'MiniJadiBot'
global.vid = 'https://raw.githubusercontent.com/alimaoie-us/Nataly-AI/main/src/AI_MENU.mp4'
global.menuvid = 'https://raw.githubusercontent.com/alimaoie-us/Nataly-AI/main/src/AI_MENU.mp4'
//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.packname = '⪛✰ 𝔈𝔪𝔦𝔩𝔩𝔦𝔞 𝔅𝔬𝔱 ✰⪜'
global.botname = ' 𝔈𝔪𝔦𝔩𝔩𝔦𝔞 𝔅𝔬𝔱🍟'
global.wm = 'Ai 𝔈𝔪𝔦𝔩𝔩𝔦𝔞 🌸'
global.author = 'Made By Ali-maoie 👑'
global.dev = '© ⍴᥆ᥕᥱrᥱძ ᑲᥡ sᥙᥒᥣіgһ𝗍 𝗍ᥱᥲm ❀'
global.textbot = 'Ai 𝔈𝔪𝔦𝔩𝔩𝔦𝔞 : Ali-maoie 🚩'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.imagen1 = fs.readFileSync('./src/img/Menu.jpg')
global.imagen2 = fs.readFileSync('./src/img/Menu2.jpg')
global.imagen3 = fs.readFileSync('./src/img/Menu3.jpg')
global.welcome = fs.readFileSync('./src/img/welcome.jpg')
global.adios = fs.readFileSync('./src/img/adios.jpg')
global.catalogo = fs.readFileSync('./src/img/catalogo.jpg')
global.miniurl = fs.readFileSync('./src/img/miniurl.jpg')
global.avatar = fs.readFileSync('./src/img/avatar_contact.jpg')

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.grupo = 'https://chat.whatsapp.com/I7sLaRBY4nIAzbnHK8hVPK' //𝔈𝔪𝔦𝔩𝔩𝔦𝔞 𝔅𝔬𝔱
global.grupo2 = 'https://chat.whatsapp.com/I7sLaRBY4nIAzbnHK8hVPK' //𝔈𝔪𝔦𝔩𝔩𝔦𝔞 𝔅𝔬𝔱
global.grupo3 = '' //team oficial
global.grupo4 = '' //GataBot & 𝔈𝔪𝔦𝔩𝔩𝔦𝔞 𝔅𝔬𝔱
global.grupo5 = '' //Curiosity & 𝔈𝔪𝔦𝔩𝔩𝔦𝔞 𝔅𝔬𝔱
global.channel = 'https://whatsapp.com/channel/0029ValqtZALtOj5BbMDRV0u'
global.channel2 = ''
global.md = '' 
global.yt = 'https://youtube.com/@newsportintern2831?si=nB1iA2C_moOferkc'
global.tiktok = ''
global.correo = ''

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.APIKeys = {
    "https://api.xyroinee.xyz": "vRFLiyLPWu",
    "https://api.lolhumaan.xyz": "GataDiosV2"
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "120363336657512636@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: '❀ sᥙ́⍴ᥱr ᥕһᥲ𝗍sᥲ⍴⍴ ᑲ᥆𝗍 ☄︎', orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.devali = info.devali
global.rg = gif.rg
//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment        

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.multiplier = 69 
global.maxwarn = '3'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.opts = {
    self: false,
    autoread: false,
    antiprivate: false,
    restrict: false,
    nyimak: false,
    pconly: false,
    gconly: false,
    swonly: false
}

global.asistencia = 'https://chat.whatsapp.com/I7sLaRBY4nIAzbnHK8hVPK' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})
