import fetch from "node-fetch";

class HangmanGame {
  constructor(id) {
    this.sessionId = id;
    this.guesses = [];
    this.maxAttempts = 6; // تم تثبيتها على 6 لتناسب مراحل الرسمة
    this.currentStage = 0;
  }

  getRandomQuest = async () => {
    try {
      const res = await fetch(`https://api.lolhuman.xyz/api/game/tebakkata?apikey=${global.lolhuman}`);
      const json = await res.json();
      if (!json || json.status !== 200) throw new Error("API Error");
      const { soal, jawaban } = json.result;
      return { clue: soal, quest: jawaban.toLowerCase().trim() };
    } catch (error) {
      throw new Error("فشل في جلب السؤال.");
    }
  };

  initializeGame = async () => {
    this.quest = await this.getRandomQuest();
    // جعل المحاولات مرنة ولكن بحد أدنى 6 محاولات
    this.maxAttempts = Math.max(6, this.quest.quest.length);
  };

  displayBoard = () => {
    const emojiStages = ["😐", "😕", "😟", "😧", "😢", "😨", "😵"];
    // حساب المرحلة المناسبة للرسمة بناءً على نسبة الأخطاء
    let stage = Math.floor((this.currentStage / this.maxAttempts) * 6);
    return `*المرحلة:* ${emojiStages[stage]}\n\`\`\`==========\n|    |\n|   ${emojiStages[stage]}\n|   ${stage >= 3 ? "/" : ""}${stage >= 4 ? "|" : ""}${stage >= 5 ? "\\" : ""}\n|   ${stage >= 1 ? "/" : ""} ${stage >= 2 ? "\\" : ""}\n|      \n|      \n==========\`\`\`\n*التلميح:* ${this.quest.clue}`;
  };

  displayWord = () =>
    this.quest.quest
      .split("")
      .map((char) => (this.guesses.includes(char) || char === " " ? `${char}` : "__"))
      .join(" ");

  makeGuess = (letter) => {
    if (!this.isAlphabet(letter)) return "invalid";
    letter = letter.toLowerCase();
    if (this.guesses.includes(letter)) return "repeat";

    this.guesses.push(letter);
    if (!this.quest.quest.includes(letter)) {
      this.currentStage++;
    }

    if (this.checkGameWin()) return "win";
    if (this.checkGameOver()) return "over";
    return "continue";
  };

  isAlphabet = (letter) => /^[a-zA-Z\u0600-\u06FF]$/.test(letter);
  checkGameOver = () => this.currentStage >= this.maxAttempts;
  checkGameWin = () =>
    [...new Set(this.quest.quest.replace(/\s/g, ""))].every((char) => this.guesses.includes(char));

  getHint = () => `*الإجابة هي:* ${this.quest.quest}`;
}

const handler = async (m, { conn, usedPrefix, command, args }) => {
  conn.hangman = conn.hangman || {};
  let action = (args[0] || "").toLowerCase();
  let inputs = args[1];

  try {
    switch (action) {
      case "end":
      case "انهاء":
      case "إنهاء":
        if (conn.hangman[m.chat]) {
          delete conn.hangman[m.chat];
          await m.reply("✅ تم إنهاء اللعبة.");
        } else await m.reply("❌ لا توجد لعبة قائمة.");
        break;

      case "start":
      case "بدء":
        if (conn.hangman[m.chat]) return m.reply(`⚠️ اللعبة قائمة بالفعل! استخدم *${usedPrefix + command} خمن*`);
        conn.hangman[m.chat] = new HangmanGame(m.sender);
        await conn.hangman[m.chat].initializeGame();
        let gameStart = conn.hangman[m.chat];
        await m.reply(`🎮 *بدأت لعبة المشنوق!*\n\n${gameStart.displayBoard()}\n\n*الكلمة:*\n${gameStart.displayWord()}\n\nللتخمين: *${usedPrefix + command} خمن [حرف]*`);
        break;

      case "guess":
      case "خمن":
        if (!conn.hangman[m.chat]) return m.reply("❌ ابدأ اللعبة أولاً.");
        if (!inputs) return m.reply("🔢 أرسل حرفاً واحداً!");
        
        let session = conn.hangman[m.chat];
        let result = session.makeGuess(inputs);

        if (result === "invalid") return m.reply("❌ أرسل حرفاً صحيحاً فقط!");
        if (result === "repeat") return m.reply("⚠️ خمنت هذا الحرف سابقاً!");

        if (result === "continue") {
          await m.reply(`${session.displayBoard()}\n\n*الكلمة:*\n${session.displayWord()}\n\n*المحاولات المتبقية:* ${session.maxAttempts - session.currentStage}\n*الحروف المستخدمة:* ${session.guesses.join(", ")}`);
        } else if (result === "win") {
          await m.reply(`🎉 فوز ساحق! الكلمة هي *${session.quest.quest}*.`);
          delete conn.hangman[m.chat];
        } else if (result === "over") {
          await m.reply(`💀 خسرنا! المشنوق مات.\nالكلمة كانت: *${session.quest.quest}*`);
          delete conn.hangman[m.chat];
        }
        break;

      case "hint":
      case "مساعدة":
        if (!conn.hangman[m.chat]) return m.reply("❌ لا توجد لعبة.");
        await m.reply(conn.hangman[m.chat].getHint());
        break;

      default:
        await m.reply(`*[ لـعـبـة المشنوق ]* 🎮\n\n- *${usedPrefix + command} بدء*\n- *${usedPrefix + command} خمن [حرف]*\n- *${usedPrefix + command} انهاء*`);
    }
  } catch (e) {
    await m.reply("❌ حدث خطأ، تأكد من مفتاح API.");
  }
};

handler.help = ["hangman"];
handler.tags = ["game"];
handler.command = ["hangman", "المشنوق", "شنق"];
handler.group = true;
handler.arabic = ["المشنوق <بدء/خمن/إنهاء>"];

export default handler;
