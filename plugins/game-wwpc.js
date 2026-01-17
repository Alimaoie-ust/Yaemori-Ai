import {
  emoji_role,
  sesi as getSesi,
  playerOnGame,
  playerOnRoom,
  playerExit,
  dataPlayer,
  dataPlayerById,
  getPlayerById,
  getPlayerById2,
  killWerewolf,
  killww,
  dreamySeer,
  sorcerer,
  protectGuardian,
  roleShuffle,
  roleChanger,
  roleAmount,
  roleGenerator,
  addTimer,
  startGame,
  playerHidup,
  playerMati,
  vote,
  voteResult,
  clearAllVote,
  getWinner,
  win,
  pagi,
  malam,
  skill,
  voteStart,
  voteDone,
  voting,
  run,
  run_vote,
  run_malam,
  run_pagi,
} from "../lib/werewolf.js";

const handler = async (m, { conn, command, usedPrefix, args }) => {
  const { sender, chat } = m;
  conn.werewolf = conn.werewolf ? conn.werewolf : {};
  const ww = conn.werewolf;
  const value = (args[0] || "").toLowerCase();
  const target = args[1];

  // التحقق من حالة اللاعب
  if (playerOnGame(sender, ww) === false)
    return m.reply("❌ أنت لست في جلسة لعبة نشطة حالياً.");

  // جلب بيانات اللاعب الحالي
  const pUser = dataPlayer(sender, ww);

  if (pUser.status === true)
    return m.reply("⚠️ لقد استخدمت مهاراتك بالفعل! يمكنك استخدام المهارة مرة واحدة فقط كل ليلة.");

  if (pUser.isdead === true) 
    return m.reply("💀 لا يمكنك استخدام المهارات لأنك ميت.");

  if (!target || target.length < 1) 
    return m.reply(`⚠️ يرجى إدخال رقم اللاعب المستهدف.\nمثال: *${usedPrefix + command} قتل 2*`);

  if (isNaN(target)) 
    return m.reply("🔢 يرجى استخدام الأرقام فقط للإشارة للاعبين.");

  let byId = getPlayerById2(sender, parseInt(target), ww);

  if (!byId) 
    return m.reply("❌ هذا اللاعب غير مسجل في اللعبة.");

  if (byId.db.isdead === true) 
    return m.reply("👻 هذا اللاعب ميت بالفعل، اختر شخصاً آخر.");

  if (byId.db.id === sender)
    return m.reply("🚫 لا يمكنك استخدام مهاراتك على نفسك!");

  // تنفيذ المهارات (دعم الأوامر العربية والإنجليزية)
  switch (value) {
    case "kill":
    case "قتل":
      if (pUser.role !== "werewolf")
        return m.reply("❌ هذا الأمر مخصص للمستذئب فقط!");
      
      if (byId.db.role === "sorcerer")
        return m.reply("🐺 لا يمكنك قتل حليفك (الساحر)!");

      pUser.status = true; // تعيين الحالة قبل التنفيذ لضمان عدم التكرار
      killWerewolf(sender, parseInt(target), ww);
      return m.reply(`🩸 قررت قتل اللاعب رقم (${target}).`);

    case "dreamy":
    case "رؤية":
    case "كشف":
      if (pUser.role !== "seer")
        return m.reply("❌ هذا الأمر مخصص للرائي (العراف) فقط!");

      let dreamy = dreamySeer(sender, parseInt(target), ww);
      let roleAr1 = {
        'werewolf': 'مستذئب 🐺',
        'warga': 'قروي 🧑',
        'seer': 'رائي 🔮',
        'guardian': 'حامي 🛡️',
        'sorcerer': 'ساحر 🧙'
      }[dreamy] || dreamy;

      pUser.status = true;
      return m.reply(`🔮 كشفت بصيرتك أن دور اللاعب رقم (${target}) هو: *${roleAr1}*`);

    case "deff":
    case "حماية":
      if (pUser.role !== "guardian")
        return m.reply("❌ هذا الأمر مخصص للحامي (الملاك) فقط!");

      pUser.status = true;
      protectGuardian(sender, parseInt(target), ww);
      return m.reply(`🛡️ لقد قررت حماية اللاعب رقم (${target}) لهذه الليلة.`);

    case "sorcerer":
    case "سحر":
      if (pUser.role !== "sorcerer")
        return m.reply("❌ هذا الأمر مخصص للساحر فقط!");

      let sorker = sorcerer(getSesi(sender), target);
      let roleAr2 = {
        'werewolf': 'مستذئب 🐺',
        'warga': 'قروي 🧑',
        'seer': 'رائي 🔮',
        'guardian': 'حامي 🛡️',
        'sorcerer': 'ساحر 🧙'
      }[sorker] || sorker;

      pUser.status = true;
      return m.reply(`🧙 سحرك كشف أن دور اللاعب رقم (${target}) هو: *${roleAr2}*`);

    default:
      return m.reply(`❓ أمر غير معروف. استخدم:\n- *${usedPrefix + command} قتل*\n- *${usedPrefix + command} رؤية*\n- *${usedPrefix + command} حماية*\n- *${usedPrefix + command} سحر*`);
  }
};

handler.help = ["wwpc <المهارة> <رقم>"];
handler.tags = ["game"];
handler.command = ["wwpc"];
handler.arabic = ["wwpc <قتل/رؤية/حماية/سحر>"];

export default handler;
