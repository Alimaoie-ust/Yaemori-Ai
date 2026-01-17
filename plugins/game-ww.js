import jimp_pkg from "jimp";
const { Jimp: jimp } = jimp_pkg;
import {
  emoji_role, sesi, playerOnGame, playerOnRoom, playerExit, dataPlayer,
  dataPlayerById, getPlayerById, getPlayerById2, killWerewolf, killww,
  dreamySeer, sorcerer, protectGuardian, roleShuffle, roleChanger,
  roleAmount, roleGenerator, addTimer, startGame, playerHidup, playerMati,
  vote, voteResult, clearAllVote, getWinner, win, pagi, malam, skill,
  voteStart, voteDone, voting, run, run_vote, run_malam, run_pagi,
} from "../lib/werewolf.js";

const resize = async (image, width, height) => {
  const read = await jimp_pkg.read(image); // تم الإصلاح هنا لضمان عمل المكتبة
  const data = await read.resize(width, height).getBufferAsync("image/jpeg");
  return data;
};

// [ الصورة المصغرة ]
let thumb = "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg";

const handler = async (m, { conn, command, usedPrefix, args }) => {
  const { sender, chat } = m;
  conn.werewolf = conn.werewolf ? conn.werewolf : {};
  const ww = conn.werewolf;
  const data = ww[chat];
  const value = (args[0] || "").toLowerCase(); // تحويل المدخلات لتبسيط التحقق
  const target = args[1];

  // [ إنشاء غرفة ]
  if (value === "create" || value === "انشاء") {
    if (chat in ww) return m.reply("❌ المجموعة في منتصف لعبة بالفعل.");
    if (playerOnGame(sender, ww)) return m.reply("❌ أنت مشارك بالفعل في لعبة أخرى.");
    
    ww[chat] = {
      room: chat, owner: sender, status: false, iswin: null,
      cooldown: null, day: 0, time: "malem", player: [],
      dead: [], voting: false, seer: false, guardian: [],
    };
    await m.reply(`✅ تم إنشاء الغرفة بنجاح!\nاكتب *${usedPrefix + command} انضمام* للانضمام.`);

  // [ انضمام ]
  } else if (value === "join" || value === "انضمام") {
    if (!ww[chat]) return m.reply("❌ لا توجد لعبة قائمة حالياً.");
    if (ww[chat].status === true) return m.reply("❌ اللعبة بدأت بالفعل.");
    if (ww[chat].player.length > 15) return m.reply("❌ الغرفة ممتلئة (الحد الأقصى 15 لاعب).");
    if (playerOnRoom(sender, chat, ww)) return m.reply("⚠️ أنت منضم للغرفة بالفعل.");
    if (playerOnGame(sender, ww)) return m.reply("❌ أنت مشارك في لعبة أخرى.");

    let pData = {
      id: sender, number: ww[chat].player.length + 1, sesi: chat,
      status: false, role: false, effect: [], vote: 0, isdead: false, isvote: false,
    };
    ww[chat].player.push(pData);

    let player = [];
    let text = `\n*🐺 قـائمة الـلاعـبـيـن (WEREWOLF) 🐺*\n\n`;
    for (let i = 0; i < ww[chat].player.length; i++) {
      text += `${ww[chat].player[i].number}) @${ww[chat].player[i].id.replace("@s.whatsapp.net", "")}\n`;
      player.push(ww[chat].player[i].id);
    }
    text += "\nالحد الأدنى 5 لاعبين والحد الأقصى 15 لاعب.";
    
    conn.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        mentionedJid: player,
        externalAdReply: {
          title: "لعبة المستذئب",
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnail: await resize(thumb, 300, 175),
          sourceUrl: "",
        },
      },
    }, { quoted: m });

  // [ بدء اللعبة ]
  } else if (value === "start" || value === "بدء") {
    if (!ww[chat]) return m.reply("❌ لا توجد لعبة قائمة.");
    if (ww[chat].player.length < 5) return m.reply("❌ يجب توفر 5 لاعبين على الأقل للبدء.");
    if (ww[chat].status === true) return m.reply("❌ اللعبة بدأت بالفعل.");
    if (ww[chat].owner !== sender) return m.reply(`👑 فقط المنشئ @${ww[chat].owner.split("@")[0]} يمكنه بدء اللعبة.`);

    roleGenerator(chat, ww);
    addTimer(chat, ww);
    startGame(chat, ww);

    let list1 = "";
    let player = [];

    for (let i = 0; i < ww[chat].player.length; i++) {
      list1 += `(${ww[chat].player[i].number}) @${ww[chat].player[i].id.split("@")[0]}\n`;
      player.push(ww[chat].player[i].id);
    }

    for (let i = 0; i < ww[chat].player.length; i++) {
      let p = ww[chat].player[i];
      if (p.isdead) continue;

      let roleText = "";
      let instructions = "";

      if (p.role === "werewolf") {
        roleText = `*المستذئب* ${emoji_role("werewolf")}`;
        instructions = `مهمتك هي أكل القرويين ليلاً.\nاكتب *.wwpc قتل [رقم]* لقتل لاعب.`;
      } else if (p.role === "warga") {
        roleText = `*قروي* ${emoji_role("warga")}`;
        instructions = `أنت قروي بسيط، حاول اكتشاف المستذئبين قبل أن يأكلوك!`;
      } else if (p.role === "seer") {
        roleText = `*الرائي (العراف)* ${emoji_role("seer")}`;
        instructions = `يمكنك كشف هوية اللاعبين.\nاكتب *.wwpc dreamy [رقم]* لمعرفة دور لاعب.`;
      } else if (p.role === "guardian") {
        roleText = `*الحامي (الملاك)* ${emoji_role("guardian")}`;
        instructions = `يمكنك حماية لاعب واحد كل ليلة.\nاكتب *.wwpc deff [رقم]* لحماية لاعب.`;
      } else if (p.role === "sorcerer") {
        roleText = `*الساحر* ${emoji_role("sorcerer")}`;
        instructions = `أنت في صف المستذئبين، يمكنك كشف الأدوار.\nاكتب *.wwpc sorcerer [رقم]* لكشف دور لاعب.`;
      }

      // إرسال الدور في الخاص مع محاولة تلافي الخطأ
      try {
        await conn.sendMessage(p.id, {
          text: `*🐺 لعبة المستذئب 🐺*\n\nأهلاً بك، دورك هو: ${roleText}\n\n${instructions}\n\n*قائمة اللاعبين*:\n${list1}`,
          mentions: player
        });
      } catch (e) { console.log("Failed to send PM to " + p.id); }
    }

    await conn.sendMessage(m.chat, {
      text: "🐺 *لعبة المستذئب - بدأت الآن!* 🐺\n\nتم توزيع الأدوار، تحقق من رسائلك الخاصة لتعرف دورك وتنفذ مهمتك. احذروا أيها القرويون، فقد تكون هذه ليلتكم الأخيرة!",
      contextInfo: {
        mentionedJid: player,
        externalAdReply: {
          title: "W E R E W O L F",
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnail: await resize(thumb, 300, 175),
        },
      }
    });
    await run(conn, chat, ww);

  // [ تصويت ]
  } else if (value === "vote" || value === "تصويت") {
    if (!ww[chat] || ww[chat].status === false) return m.reply("❌ اللعبة لم تبدأ بعد.");
    if (ww[chat].time !== "voting") return m.reply("❌ ليس وقت التصويت الآن.");
    if (!playerOnRoom(sender, chat, ww)) return m.reply("❌ أنت لست مشاركاً في هذه اللعبة.");
    if (dataPlayer(sender, ww).isdead) return m.reply("💀 الموتى لا يصوتون!");
    if (!target || isNaN(target)) return m.reply("⚠️ يرجى إدخال رقم اللاعب للتصويت له.");
    if (dataPlayer(sender, ww).isvote) return m.reply("⚠️ لقد قمت بالتصويت بالفعل.");

    let b = getPlayerById(chat, sender, parseInt(target), ww);
    if (!b || b.db.isdead) return m.reply("❌ اللاعب غير موجود أو ميت بالفعل.");

    vote(chat, parseInt(target), sender, ww);
    return m.reply(`✅ تم تسجيل تصويتك ضد اللاعب رقم ${target}.`);

  // [ خروج ]
  } else if (value === "exit" || value === "خروج") {
    if (!ww[chat]) return m.reply("❌ لا توجد جلسة نشطة.");
    if (!playerOnRoom(sender, chat, ww)) return m.reply("⚠️ أنت لست في الغرفة.");
    if (ww[chat].status) return m.reply("❌ بدأت اللعبة، لا يمكنك الهروب الآن!");
    
    m.reply(`👋 خرج @${sender.split("@")[0]} من الغرفة.`, { mentions: [sender] });
    playerExit(chat, sender, ww);

  // [ حذف الجلسة ]
  } else if (value === "delete" || value === "حذف") {
    if (!ww[chat]) return m.reply("❌ لا توجد جلسة لحذفها.");
    if (ww[chat].owner !== sender) return m.reply("👑 فقط منشئ الغرفة يمكنه حذفها.");
    
    delete ww[chat];
    m.reply("🗑️ تم حذف جلسة المستذئب بنجاح.");

  // [ قائمة اللاعبين ]
  } else if (value === "player" || value === "اللاعبين") {
    if (!ww[chat]) return m.reply("❌ لا توجد لعبة قائمة.");
    let text = "\n*🐺 قائمة اللاعبين الحالية 🐺*\n\n";
    let player = [];
    for (let i = 0; i < ww[chat].player.length; i++) {
      let p = ww[chat].player[i];
      text += `(${p.number}) @${p.id.split("@")[0]} ${p.isdead ? `☠️ [${p.role}]` : ""}\n`;
      player.push(p.id);
    }
    conn.sendMessage(m.chat, { text, mentions: player }, { quoted: m });

  // [ المساعدة الافتراضية ]
  } else {
    let text = `\n*🐺 لعبة الـمـسـتـذئـب (WEREWOLF) 🐺*\n\nلعبة ذكاء واجتماع، حيث يختبئ المستذئبون بين القرويين ويحاولون القضاء عليهم.\n\n*🎮 الأوامـر:*\n`;
    text += ` • ${usedPrefix + command} انشاء\n`;
    text += ` • ${usedPrefix + command} انضمام\n`;
    text += ` • ${usedPrefix + command} بدء\n`;
    text += ` • ${usedPrefix + command} تصويت [رقم]\n`;
    text += ` • ${usedPrefix + command} اللاعبين\n`;
    text += ` • ${usedPrefix + command} خروج\n`;
    text += ` • ${usedPrefix + command} حذف\n\nتتطلب اللعبة من 5 إلى 15 لاعباً.`;
    
    conn.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        externalAdReply: {
          title: "W E R E W O L F  G A M E",
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnail: await resize(thumb, 300, 175),
        },
      },
    }, { quoted: m });
  }
};

handler.help = ["ww"];
handler.tags = ["game"];
handler.command = /^(ww|مستذئب)/i;
handler.arabic = ["مستذئب <انشاء/انضمام/بدء/تصويت/لاعبين/خروج/حذف>"];

export default handler;
