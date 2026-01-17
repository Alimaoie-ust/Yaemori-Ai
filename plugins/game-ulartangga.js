import jimp_pkg from "jimp";
const { Jimp } = jimp_pkg; 
import axios from "axios";

class SnakeAndLadderGame {
  constructor(sMsg) {
    this.sendMsg = sMsg; // هذا هو conn
    this.players = [];
    this.boardSize = 100;
    this.snakesAndLadders = [
      { start: 29, end: 7 }, { start: 24, end: 12 }, { start: 15, end: 37 },
      { start: 23, end: 41 }, { start: 72, end: 36 }, { start: 49, end: 86 },
      { start: 90, end: 56 }, { start: 75, end: 64 }, { start: 74, end: 95 },
      { start: 91, end: 72 }, { start: 97, end: 78 }
    ];
    this.currentPositions = {};
    this.currentPlayerIndex = 0;
    this.bgImageUrl = "https://i.pinimg.com/originals/2f/68/a7/2f68a7e1eee18556b055418f7305b3c0.jpg";
    this.playerImageUrls = {
      red: "https://telegra.ph/file/86fd8ea9311e2bc99ae63.jpg", 
      green: "https://dkonten.com/studio/wp-content/uploads/sites/19/2023/05/search-1.png",
    };
    this.bgImage = null;
    this.playerImages = { red: null, green: null };
    this.cellWidth = 40;
    this.cellHeight = 40;
    this.keyId = null;
    this.started = false;
  }

  initializeGame() {
    this.players.forEach((player) => (this.currentPositions[player] = 1));
    this.currentPlayerIndex = 0;
    this.started = true;
  }

  rollDice = () => Math.floor(Math.random() * 6) + 1;

  fetchImage = async (url) => {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      return await jimp_pkg.read(Buffer.from(response.data, "binary"));
    } catch (error) {
      console.error(`خطأ في جلب الصورة من ${url}:`, error);
      throw error;
    }
  };

  getBoardBuffer = async () => {
    if (!this.bgImage) this.bgImage = await this.fetchImage(this.bgImageUrl);
    const board = this.bgImage.clone().resize(420, 420);

    for (const player of this.players) {
      const { x, y } = this.calculatePlayerPosition(player);
      const pImg = await this.getPlayerImage(player);
      board.composite(pImg, x, y);
    }
    return await board.getBufferAsync("image/png");
  };

  calculatePlayerPosition = (player) => {
    const playerPosition = this.currentPositions[player];
    const row = 9 - Math.floor((playerPosition - 1) / 10);
    let col = (playerPosition - 1) % 10;
    
    // تعديل الحركة المتعرجة (Zigzag) للسلم والثعبان
    if (Math.floor((playerPosition - 1) / 10) % 2 !== 0) {
        col = 9 - col;
    }

    const x = col * this.cellWidth + 10;
    const y = row * this.cellHeight + 10;
    return { x, y };
  };

  getPlayerImage = async (player) => {
    const color = this.getPlayerColor(player);
    if (!this.playerImages[color]) {
      this.playerImages[color] = await this.fetchImage(this.playerImageUrls[color]);
    }
    return this.playerImages[color].clone().resize(this.cellWidth, this.cellHeight);
  };

  getPlayerColor = (player) => (player === this.players[0] ? "red" : "green");

  formatPlayerName = (player) => {
    const color = this.getPlayerColor(player);
    const colorAr = color === "red" ? "الأحمر" : "الأخضر";
    return `@${player.split("@")[0]} (${colorAr})`;
  };

  startGame = async (m, player1Name, player2Name) => {
    await this.sendMsg.reply(m.chat, `🐍🎲 *مرحباً بكم في لعبة السلم والثعبان!* 🎲🐍 \n\n${this.formatPlayerName(player1Name)} *ضد* ${this.formatPlayerName(player2Name)}`, m, { mentions: [player1Name, player2Name] });

    this.players = [player1Name, player2Name];
    this.initializeGame();
    
    const buffer = await this.getBoardBuffer();
    const sentMsg = await this.sendMsg.sendMessage(m.chat, { image: buffer, caption: `*بدأت اللعبة!* الدور الآن على: ${this.formatPlayerName(this.players[0])}` }, { quoted: m });
    this.keyId = sentMsg.key;
  };

  playTurn = async (m, player) => {
    if (player !== this.players[this.currentPlayerIndex])
      return m.reply(`🕒 *ليس دورك.* \n\nالدور الآن على: ${this.formatPlayerName(this.players[this.currentPlayerIndex])}`);

    const diceRoll = this.rollDice();
    const currentPos = this.currentPositions[player];
    let newPosition = currentPos + diceRoll;

    let responseText = `🎲 ${this.formatPlayerName(player)} *رمى النرد..*\n\n  - الرقم: *${diceRoll}*\n  - من مربع: *${currentPos}*\n  - إلى مربع: *${newPosition > 100 ? currentPos : newPosition}*`;

    if (newPosition <= this.boardSize) {
      const checkSnakeOrLadder = this.snakesAndLadders.find((s) => s.start === newPosition);
      if (checkSnakeOrLadder) {
        const isSnake = checkSnakeOrLadder.end < checkSnakeOrLadder.start;
        responseText += `\n${isSnake ? '😢 ثعبان 🐍' : '🤩 سلم 🪜'}! انتقل إلى المربع *${checkSnakeOrLadder.end}*`;
        this.currentPositions[player] = checkSnakeOrLadder.end;
      } else {
        this.currentPositions[player] = newPosition;
      }

      if (this.currentPositions[player] === this.boardSize) {
        await this.sendMsg.reply(m.chat, `${responseText}\n\n🎉 مبروك ${this.formatPlayerName(player)} لقد فزت!`, m, { mentions: [player] });
        this.resetSession();
        return true; 
      }

      if (diceRoll !== 6) this.currentPlayerIndex = 1 - this.currentPlayerIndex;
      else responseText += "\n🎲 *رقم 6!* رمية إضافية.";
    } else {
      responseText += "\n🔄 تجاوزت 100، بقي دورك.";
      this.currentPlayerIndex = 1 - this.currentPlayerIndex;
    }

    await m.reply(responseText);
    
    if (this.keyId) {
        try { await this.sendMsg.sendMessage(m.chat, { delete: this.keyId }); } catch (e) {}
    }
    
    const buffer = await this.getBoardBuffer();
    const nextPlayer = this.formatPlayerName(this.players[this.currentPlayerIndex]);
    const sentMsg = await this.sendMsg.sendMessage(m.chat, { image: buffer, caption: `الدور التالي: ${nextPlayer}` }, { quoted: m });
    this.keyId = sentMsg.key;
  };

  resetSession = () => {
    this.players = [];
    this.currentPositions = {};
    this.started = false;
  };
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  conn.ulartangga = conn.ulartangga || {};
  let sessionId = m.chat;

  if (!conn.ulartangga[sessionId]) {
    conn.ulartangga[sessionId] = {
      state: false,
      game: new SnakeAndLadderGame(conn)
    };
  }

  const session = conn.ulartangga[sessionId];
  const game = session.game;
  const action = (args[0] || "").toLowerCase();

  switch (action) {
    case "انضمام":
    case "join":
      if (session.state) return m.reply("🛑 اللعبة بدأت بالفعل.");
      if (game.players.length >= 2) return m.reply("⚠️ اللعبة ممتلئة.");
      if (game.players.includes(m.sender)) return m.reply("أنت منضم بالفعل.");
      game.players.push(m.sender);
      m.reply(`👋 ${game.formatPlayerName(m.sender)} انضم.`);
      break;

    case "بدء":
    case "start":
      if (session.state) return m.reply("اللعبة قائمة.");
      if (game.players.length < 2) return m.reply("مطلوب لاعبين اثنين.");
      session.state = true;
      await game.startGame(m, game.players[0], game.players[1]);
      break;

    case "رمي":
    case "roll":
      if (!session.state) return m.reply("ابدأ اللعبة أولاً.");
      const isFinished = await game.playTurn(m, m.sender);
      if (isFinished) session.state = false;
      break;

    case "اعادة":
    case "reset":
      session.state = false;
      game.resetSession();
      m.reply("🔄 تم إعادة الضبط.");
      break;

    default:
      m.reply(`🎲 *لعبة السلم والثعبان*\n\n*الأوامر:*\n- ${usedPrefix + command} انضمام\n- ${usedPrefix + command} بدء\n- ${usedPrefix + command} رمي\n- ${usedPrefix + command} اعادة`);
  }
};

handler.help = ["سلم"];
handler.tags = ["game"];
handler.command = /^(سلم|ثعبان|ular|ladders|snake)$/i;
handler.arabic = ["سلم <انضمام/بدء/رمي/اعادة>"];

export default handler;
