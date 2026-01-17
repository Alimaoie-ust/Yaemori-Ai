class Blackjack {
  decks;
  state = "waiting";
  player = [];
  dealer = [];
  table = {
    player: {
      total: 0,
      cards: [],
    },
    dealer: {
      total: 0,
      cards: [],
    },
    bet: 0,
    payout: 0,
    doubleDowned: false,
  };
  cards;
  endHandlers = [];
  constructor(decks) {
    this.decks = validateDeck(decks);
  }
  placeBet(bet) {
    if (bet <= 0) {
      throw new Error("يجب أن يكون الرهان أكبر من 0");
    }
    this.table.bet = bet;
  }
  start() {
    if (this.table.bet <= 0) {
      throw new Error("يجب عليك وضع رهان قبل بدء اللعبة");
    }
    this.cards = new Deck(this.decks);
    this.cards.shuffleDeck(2);
    this.player = this.cards.dealCard(2);
    let dealerFirstCard;
    do {
      dealerFirstCard = this.cards.dealCard(1)[0];
    } while (dealerFirstCard.value > 11);
    this.dealer = [dealerFirstCard, ...this.cards.dealCard(1)];
    this.updateTable();
    return this.table;
  }
  hit() {
    if (this.state === "waiting") {
      const newCard = this.cards.dealCard(1)[0];
      this.player.push(newCard);
      this.updateTable();
      const playerSum = sumCards(this.player);
      const dealerSum = sumCards(this.dealer);
      if (playerSum === dealerSum) {
        this.state = "draw";
        this.emitEndEvent();
      } else if (playerSum === 21) {
        this.state = "player_blackjack";
        this.emitEndEvent();
      } else if (playerSum > 21) {
        this.state = "dealer_win";
        this.emitEndEvent();
      }
      return this.table;
    }
  }
  stand() {
    let dealerSum = sumCards(this.dealer);
    let playerSum = sumCards(this.player);
    if (playerSum <= 21) {
      while (dealerSum < 17) {
        this.dealer.push(...this.cards.dealCard(1));
        dealerSum = sumCards(this.dealer);
        this.updateTable();
      }
    }
    if (playerSum <= 21 && (dealerSum > 21 || dealerSum < playerSum)) {
      if (playerSum === 21) {
        this.state = "player_blackjack";
      } else {
        this.state = "player_win";
      }
    } else if (dealerSum === playerSum) {
      this.state = "draw";
    } else {
      this.state = dealerSum === 21 ? "dealer_blackjack" : "dealer_win";
    }
    this.emitEndEvent();
  }
  doubleDown() {
    if (this.canDoubleDown()) {
      this.table.doubleDowned = true;
      this.player.push(...this.cards.dealCard(1));
      this.updateTable();
      this.stand();
    } else {
      throw new Error("يمكنك مضاعفة الرهان في الجولة الأولى فقط");
    }
  }
  calculatePayout() {
    if (this.state === "player_blackjack") {
      this.table.payout = this.table.bet * 1.5;
    } else if (this.state === "player_win") {
      this.table.payout = this.table.bet;
    } else if (
      this.state === "dealer_win" ||
      this.state === "dealer_blackjack"
    ) {
      this.table.payout = 0;
    } else if (this.state === "draw") {
      this.table.payout = this.table.bet;
    }
    if (this.table.doubleDowned && this.state !== "draw") {
      this.table.payout *= 2;
    }
    this.table.payout = Math.round(this.table.payout);
  }
  canDoubleDown() {
    return this.state === "waiting" && this.player.length === 2;
  }
  onEnd(handler) {
    this.endHandlers.push(handler);
  }
  emitEndEvent() {
    this.calculatePayout();
    for (let handler of this.endHandlers) {
      handler({
        state: this.state,
        player: formatCards(this.player),
        dealer: formatCards(this.dealer),
        bet: this.table.bet,
        payout: this.table.payout,
      });
    }
  }
  updateTable() {
    this.table.player = formatCards(this.player);
    this.table.dealer = formatCards(this.dealer);
  }
}

class Deck {
  deck = [];
  dealtCards = [];
  constructor(decks) {
    for (let i = 0; i < decks; i++) {
      this.createDeck();
    }
  }
  createDeck() {
    const card = (suit, value) => {
      // تعريب أسماء البطاقات
      let translatedSuit = suit === "♣️" ? "سباتي" : suit === "♦️" ? "ديناري" : suit === "♠️" ? "باصوني" : "كبّة";
      let name = value + " " + translatedSuit;
      
      if (
        value.toUpperCase().includes("J") ||
        value.toUpperCase().includes("Q") ||
        value.toUpperCase().includes("K")
      )
        value = "10";
      if (value.toUpperCase().includes("A")) value = "11";
      return {
        name,
        suit,
        value: +value,
      };
    };
    const values = [
      "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"
    ];
    const suits = ["♣️", "♦️", "♠️", "♥️"];
    for (let s = 0; s < suits.length; s++) {
      for (let v = 0; v < values.length; v++) {
        this.deck.push(card(suits[s], values[v]));
      }
    }
  }
  shuffleDeck(amount = 1) {
    for (let i = 0; i < amount; i++) {
      for (let c = this.deck.length - 1; c >= 0; c--) {
        const tempVal = this.deck[c];
        let randomIndex = Math.floor(Math.random() * this.deck.length);
        while (randomIndex === c) {
          randomIndex = Math.floor(Math.random() * this.deck.length);
        }
        this.deck[c] = this.deck[randomIndex];
        this.deck[randomIndex] = tempVal;
      }
    }
  }
  dealCard(numCards) {
    const cards = [];
    for (let c = 0; c < numCards; c++) {
      const dealtCard = this.deck.shift();
      if (dealtCard) {
        cards.push(dealtCard);
        this.dealtCards.push(dealtCard);
      }
    }
    return cards;
  }
}

function sumCards(cards) {
  let value = 0;
  let numAces = 0;
  for (const card of cards) {
    value += card.value;
    numAces += card.value === 11 ? 1 : 0;
  }
  while (value > 21 && numAces > 0) {
    value -= 10;
  }
  return value;
}

function formatCards(cards) {
  return {
    total: sumCards(cards),
    cards,
  };
}

function validateDeck(decks) {
  if (!decks) throw new Error("يجب تحديد عدد الطوابق");
  if (decks < 1) throw new Error("يجب أن يكون هناك طابق واحد على الأقل");
  if (decks > 8) throw new Error("لا يمكن أن يتجاوز عدد الطوابق 8");
  return decks;
}

// تعديل العملة لتناسب السياق العربي (مثلاً ريال أو نقطة)
const formatter = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
});

const templateBlackjackMessage = (usedPrefix, command, conn, m, blackjack) => {
  const { table, state } = blackjack;
  const { bet, dealer, player, payout } = table;
  let message = "";
  const dealerCards = dealer.cards.map((card) => `${card.name}`).join(", ");
  const dealerTotal = dealer.total;
  const playerCards = player.cards.map((card) => `${card.name}`).join(", ");
  const playerTotal = player.total;

  let hiddenDealerCards = dealer.cards
    .slice(0, -1)
    .map((card) => `${card.name}`)
    .join(", ");
  if (dealer.cards.length > 1) {
    hiddenDealerCards += ", ❓";
  } else {
    hiddenDealerCards += `, ${dealer.cards[0].name}`;
  }

  switch (state) {
    case "player_win":
    case "dealer_win":
    case "draw":
    case "player_blackjack":
    case "dealer_blackjack":
      hiddenDealerCards = dealer.cards.map((card) => `${card.name}`).join(", ");
      
      let statusText = "";
      if (state === "player_win") statusText = "لقد فزت! 🎉";
      else if (state === "dealer_win") statusText = "فاز الموزع. 😔";
      else if (state === "draw") statusText = "تعادل. 🤝";
      else if (state === "player_blackjack") statusText = "بلاك جاك! 🥳";
      else statusText = "الموزع حصل على بلاك جاك! 😔";

      message = `*\`🃏 • بـلاك جـاك •\`*

╭───┈ •
│ *بطاقاتك:*\n│ \`${playerCards}\`
│ *مجموعك:*\n│ \`${playerTotal}\`
├───┈ •
│ *بطاقات الموزع:*\n│ \`${dealerCards}\`
│ *مجموع الموزع:*\n│ \`${dealerTotal > 21 ? "خاسر (BUST)" : dealerTotal}\`
╰───┈ •

> *\`${statusText.toUpperCase()}\`*
*الرهان:* \`${formatter.format(bet)}\`
*الأرباح:* \`${formatter.format(payout)}\`
`;
      global.db.data.users[conn.blackjack[m.chat].idPemain].money += payout;
      delete conn.blackjack[m.chat];
      break;
    default:
      message = `*\`🃏 • بـلاك جـاك •\`*

╭───┈ •
│ *بطاقاتك:*\n│ \`${playerCards}\`
│ *مجموعك:*\n│ \`${playerTotal}\`
├───┈ •
│ *بطاقات الموزع:*\n│ \`${hiddenDealerCards}\`
│ *مجموع الموزع:*\n│ \`${dealerTotal > 21 ? "خاسر" : "❓"}\`
╰───┈ •

*الرهان:* \`${formatter.format(bet)}\`

اكتب *\`${usedPrefix + command} hit\`* لسحب بطاقة.
اكتب *\`${usedPrefix + command} stand\`* لإنهاء دورك.`;
      break;
  }
  return message;
};

const handler = async (m, { conn, usedPrefix, command, args }) => {
  conn.blackjack = conn.blackjack || {};
  let [aksi, argumen] = args;

  try {
    switch (aksi) {
      case "end":
      case "إنهاء":
        if (conn.blackjack[m.chat]?.idPemain === m.sender) {
          delete conn.blackjack[m.chat];
          await conn.reply(m.chat, "*لقد خرجت من جلسة البلاك جاك.* 👋", m);
        } else {
          await conn.reply(m.chat, "*لا توجد جلسة قائمة أو أنك لست اللاعب.*", m);
        }
        break;

      case "start":
      case "بدء":
        if (conn.blackjack[m.chat]) {
          await conn.reply(m.chat, `*الجلسة قائمة بالفعل.* استخدم *${usedPrefix + command} end* للخروج.`, m);
        } else {
          conn.blackjack[m.chat] = new Blackjack(1);
          conn.blackjack[m.chat].idPemain = m.sender;
          let betAmount = argumen ? parseInt(argumen) : 1000;
          conn.blackjack[m.chat].placeBet(betAmount);
          conn.blackjack[m.chat].start();
          const table = conn.blackjack[m.chat];
          const pesanStart = templateBlackjackMessage(usedPrefix, command, conn, m, table);
          await conn.reply(m.chat, pesanStart, m);
        }
        break;

      case "hit":
      case "سحب":
        if (!conn.blackjack[m.chat] || conn.blackjack[m.chat]?.idPemain !== m.sender) {
          await conn.reply(m.chat, "*أنت لا تلعب حالياً.*", m);
          break;
        }
        conn.blackjack[m.chat].hit();
        const tableHit = conn.blackjack[m.chat];
        await conn.reply(m.chat, templateBlackjackMessage(usedPrefix, command, conn, m, tableHit), m);
        break;

      case "stand":
      case "توقف":
        if (!conn.blackjack[m.chat] || conn.blackjack[m.chat]?.idPemain !== m.sender) {
          await conn.reply(m.chat, "*أنت لا تلعب حالياً.*", m);
          break;
        }
        conn.blackjack[m.chat].stand();
        const tableStand = conn.blackjack[m.chat];
        await conn.reply(m.chat, templateBlackjackMessage(usedPrefix, command, conn, m, tableStand), m);
        break;

      case "double":
      case "مضاعفة":
        if (!conn.blackjack[m.chat] || conn.blackjack[m.chat]?.idPemain !== m.sender) {
          await conn.reply(m.chat, "*أنت لا تلعب حالياً.*", m);
          break;
        }
        conn.blackjack[m.chat].doubleDown();
        const tableDouble = conn.blackjack[m.chat];
        await conn.reply(m.chat, templateBlackjackMessage(usedPrefix, command, conn, m, tableDouble), m);
        break;

      default:
        await conn.reply(m.chat, `*أمر غير صالح.*\nاستخدم *${usedPrefix + command} start* لبدء اللعبة.`, m);
        break;
    }
  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, `*خطأ:* ${err.message}`, m);
  }
};

handler.command = ["blackjack", "بلاك_جاك"];
handler.tags = ["game"];
handler.help = ["blackjack"];
handler.arabic = ["بلاك_جاك <بدء/سحب/توقف/إنهاء>"];

export default handler;
