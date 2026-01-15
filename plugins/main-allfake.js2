import pkg from '@adiwajshing/baileys';
import fs from 'fs';
import fetch from 'node-fetch';
import axios from 'axios';
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment-timezone';

const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg;

var handler = m => m;

handler.all = async function (m) {
  try {

    // ==== GLOBAL HELPERS ====
    global.getBuffer = async function getBuffer(url, options) {
      try {
        options ? options : {};
        var res = await axios({
          method: "get",
          url,
          headers: {
            'DNT': 1,
            'User-Agent': 'GoogleBot',
            'Upgrade-Insecure-Request': 1
          },
          ...options,
          responseType: 'arraybuffer'
        });
        return res.data;
      } catch (e) {
        console.log(`Error : ${e}`);
      }
    };

    // ==== PROFILE PICTURE ====
    let who = m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.fromMe
      ? this.user.jid
      : m.sender;

    global.fotoperfil = await conn.profilePictureUrl(who, 'image').catch(_ => 
      'https://files.catbox.moe/6ditf1.jpg'
    );

    // ==== USER & BOT DATA ====
    let user = global.db.data.users[m.sender];
    let bot = global.db.data.settings[conn.user.jid];
    let pushname = m.pushName || 'Sin nombre';

    // ==== RANDOM CHANNEL PICKER ====
    global.idchannel = '120363420838251363@newsletter';
    global.canalIdM = [
      "120363420838251363@newsletter",
      "120363420838251363@newsletter",
      "120363420838251363@newsletter",
      "120363420838251363@newsletter"
    ];
    global.canalNombreM = [
      "MegaChannel1",
      "MegaChannel2",
      "MegaChannel3",
      "MegaChannel4"
    ];
    global.channelRD = await getRandomChannel();

    // ==== 9 IMAGES FOR RANDOM THUMBNAIL ====
    const imageList = [
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori1.jpg",
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori2.jpg",
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori3.jpg",
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori4.jpg",
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori5.jpg",
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori6.jpg",
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori7.jpg",
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori8.jpg",
      "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori9.jpg"
    ];

    const randomImage = imageList[Math.floor(Math.random() * imageList.length)];

    // ==== GLOBAL adReply ====
    global.adReply = {
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.idchannel,
          serverMessageId: 103,
          newsletterName: `NATALY AI | هيا نحو النجاح 🧑‍🏫`
        },
        externalAdReply: {
          title: bot?.name || conn.user?.name || 'Bot',
          body: global.ucapan || '',
          thumbnailUrl: randomImage,
          sourceUrl: null,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    };

    // ==== GLOBAL rcanal (View Channel) ====
    global.rcanal = {
      contextInfo: {
        forwardingScore: 2025,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.channelRD.id,
          newsletterName: global.channelRD.name,
          serverMessageId: -1
        },
        externalAdReply: {
          title: conn.user?.name || 'Bot',
          body: '💥 هذا البوت ⚡',
          sourceUrl: null,
          thumbnailUrl: randomImage
        }
      }
    };

    // ==== REACTIONS ====
    global.rwait = '🕒';
    global.done = '✅';
    global.error = '✖️';

    // ==== EMOJIS ====
    global.emoji = '🔥';
    global.emoji2 = '💥';
    global.emoji3 = '❤️‍🔥';
    global.emoji4 = '🍭';
    global.emojis = [global.emoji, global.emoji2, global.emoji3, global.emoji4].getRandom();

    // ==== WAIT TEXT ====
    global.wait = '🕒 *𝗘𝘀𝗽𝗲𝗿𝗮 𝗨𝗻 𝗠𝗼𝗺𝗲𝗻𝘁𝗼...*';

    // ==== LINKS / REDES ====
    var canal1 = 'https://whatsapp.com/channel/0029Vb7Ji66KbYMTYLU9km3p';
    var git     = 'https://github.com/alimaoie-us';
    var youtube = 'https://youtube.com/@newsportintern2831';
    var github  = 'https://github.com/alimaoie-us/yaemori-Ai';
    let correo  = 'iconemoment1@gmail.com';

    global.redes = [canal1, git, youtube, github, correo].getRandom();

    // ==== RANDOM ICONS ====
    let category = "imagen";
    const db = './src/database/db.json';
    const db_ = JSON.parse(fs.readFileSync(db));
    const randomIndex = Math.floor(Math.random() * db_.links[category].length);
    const randomlink = db_.links[category][randomIndex];
    const response = await fetch(randomlink);
    const rimg = await response.buffer();
    global.icons = rimg;

    // ==== GREETINGS BASED ON TIME ====
    var ase = new Date();
    var hour = ase.getHours();
    switch(hour) {
      case 0: case 1: case 2: hour = '💤 ليل'; break;
      case 3: case 4: case 5: hour = '🌄 صباح'; break;
      case 6: case 7: case 8: hour = '🌅 صباح'; break;
      case 9: case 10: case 11: hour = '☀️ نهار'; break;
      case 12: case 13: case 14: hour = '☀️ نهار'; break;
      case 15: case 16: case 17: hour = '🌇 عصر'; break;
      case 18: case 19: case 20: hour = '🌃 مساء'; break;
      case 21: case 22: case 23: hour = '🌌 ليل'; break;
      default: hour = '🌙 يوم';
    }
    global.saludo = hour;

    // ==== NAMES / TAGS ====
    global.nombre = await conn.getName(m.sender);
    global.taguser = '@' + m.sender.split("@")[0];

    // ==== READ MORE HANDLER ====
    var more = String.fromCharCode(8206);
    global.readMore = more.repeat(850);

    // ==== FAKE CONTACT GENERATOR ====
    global.getFkontak = (sender) => ({
      key: { 
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Halo"
      },
      message: { 
        contactMessage: { 
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Phone\nEND:VCARD`
        }
      },
      participant: "0@s.whatsapp.net"
    });

  } catch (e) {
    console.log("❌ allfakes.js error:", e);
  }
};

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function getRandomChannel() {
  let randomIndex = Math.floor(Math.random() * global.canalIdM.length);
  let id   = global.canalIdM[randomIndex];
  let name = global.canalNombreM[randomIndex];
  return { id, name };
}