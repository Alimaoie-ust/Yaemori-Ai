let handler = (m) => m;
handler.before = async function (m) {
  this.suit = this.suit ? this.suit : {};
  if (global.db.data.users[m.sender].exp < 0) global.db.data.users[m.sender].exp = 0;
  
  let room = Object.values(this.suit).find(
    (room) => room.id && room.status && [room.p, room.p2].includes(m.sender),
  );

  if (room) {
    let win = "";
    let tie = false;
    
    // قبول أو رفض التحدي
    if (m.sender == room.p2 && /^(موافق|نعم|ok|تم|رفض|لا|acc(ept)?|tolak|nanti)/i.test(m.text) && m.isGroup && room.status == "wait") {
      if (/^(رفض|لا|tolak|nanti)/i.test(m.text)) {
        this.reply(m.chat, `@${room.p2.split`@`[0]} رفض التحدي، تم إلغاء اللعبة.`, m);
        delete this.suit[room.id];
        return !0;
      }
      
      room.status = "play";
      room.asal = m.chat;
      clearTimeout(room.waktu);
      
      m.reply(`🎮 تم قبول التحدي!\nالرجاء الاختيار من الخاص:\nwa.me/${this.user.jid.split`@`[0]}`, m.chat, { mentions: [room.p, room.p2] });

      const menu = `*[ حـجـر ورقة مـقـص ]*\n\nيرجى إرسال اختيارك:\n- حجر ✊\n- ورقة ✋\n- مقص ✌️`;
      await this.reply(room.p, menu, m);
      await this.reply(room.p2, menu, m);

      room.waktu_milih = setTimeout(() => {
        this.reply(room.asal, `⌛ انتهى وقت الاختيار، تم إلغاء اللعبة تلقائياً.`);
        delete this.suit[room.id];
      }, room.timeout);
    }

    // منطق الاختيار في الخاص
    let reg = /^(مقص|حجر|ورقة|gunting|batu|kertas)/i;
    if (!m.isGroup && reg.test(m.text)) {
      let isP1 = m.sender === room.p;
      let isP2 = m.sender === room.p2;
      let choice = reg.exec(m.text.toLowerCase())[0];

      if (isP1 && !room.pilih) {
        room.pilih = choice;
        room.text = m.text;
        m.reply(`✅ اخترت: ${m.text}`);
        if (!room.pilih2) this.reply(room.p2, "_الخصم اختار بالفعل، دورك الآن!_", null);
      }
      if (isP2 && !room.pilih2) {
        room.pilih2 = choice;
        room.text2 = m.text;
        m.reply(`✅ اخترت: ${m.text}`);
        if (!room.pilih) this.reply(room.p, "_الخصم اختار بالفعل، دورك الآن!_", null);
      }

      // حساب النتيجة عند اكتمال الاختيارين
      if (room.pilih && room.pilih2) {
        clearTimeout(room.waktu_milih);
        let p1 = room.pilih, p2 = room.pilih2;
        
        // المنطق الموحد (العربي والإنجليزي)
        const isRock = (v) => /حجر|batu/i.test(v);
        const isPaper = (v) => /ورقة|kertas/i.test(v);
        const isSciss = (v) => /مقص|gunting/i.test(v);

        if (isRock(p1) && isSciss(p2)) win = room.p;
        else if (isRock(p1) && isPaper(p2)) win = room.p2;
        else if (isSciss(p1) && isPaper(p2)) win = room.p;
        else if (isSciss(p1) && isRock(p2)) win = room.p2;
        else if (isPaper(p1) && isRock(p2)) win = room.p;
        else if (isPaper(p1) && isSciss(p2)) win = room.p2;
        else if (p1 === p2) tie = true;

        let resultText = `*[ نـتـيـجـة التحدي ]*\n\n`;
        resultText += `@${room.p.split`@`[0]} اختر (${room.text}) ${tie ? "" : (win == room.p ? '🏆 فوز' : '❌ خسارة')}\n`;
        resultText += `@${room.p2.split`@`[0]} اختر (${room.text2}) ${tie ? "" : (win == room.p2 ? '🏆 فوز' : '❌ خسارة')}\n`;

        this.reply(room.asal, resultText.trim(), null, { mentions: [room.p, room.p2] });
        
        if (!tie) {
          global.db.data.users[win].exp += room.poin;
          let loser = (win === room.p ? room.p2 : room.p);
          global.db.data.users[loser].exp += room.poin_lose;
        }
        delete this.suit[room.id];
      }
    }
  }
  return !0;
};
export default handler;
