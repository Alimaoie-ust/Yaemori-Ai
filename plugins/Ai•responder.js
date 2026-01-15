import fetch from 'node-fetch';

const gemini = {
  getNewCookie: async function () {
    try {
      const r = await fetch("https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c", {
        headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
        method: "POST"
      });
      const cookieHeader = r.headers.get('set-cookie');
      return cookieHeader ? cookieHeader.split(';')[0] : null;
    } catch { return null; }
  },

  ask: async function (prompt, senderId, userName = "المستخدم") {
    const headers = {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "cookie": await this.getNewCookie()
    };
    
    const userHistory = global.yaemoriDB.history[senderId] || [];
    const context = userHistory.slice(-4).map(h => `المستخدم: ${h.q}\nياموري: ${h.a}`).join("\n");

    const systemPrompt = `أنتِ ياموري، مطوركِ علي ماوي. سياق الحوار السابق:\n${context}\n\nنادي المستخدم بـ ${userName}. أجب بلهجة ودية.`;
    
    const b = [[systemPrompt + "\nسؤال المستخدم الحالي: " + prompt], ["ar"], null];
    const body = new URLSearchParams({ "f.req": JSON.stringify([null, JSON.stringify(b)]) });

    const response = await fetch(`https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c`, {
      headers, body, method: 'POST'
    });

    const data = await response.text();
    const match = [...data.matchAll(/^\d+\n(.+?)\n/gm)];
    for (const chunk of match.reverse()) {
      try {
        const parse1 = JSON.parse(JSON.parse(chunk[1])[0][2]);
        if (parse1?.[4]?.[0]?.[1]?.[0]) {
          return parse1[4][0][1][0].replace(/\*\*(.+?)\*\*/g, `*$1*`);
        }
      } catch {}
    }
    throw new Error("AI Failed");
  }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // جلب الإعدادات من قاعدة البيانات الدائمة
  let settings = global.db.data.settings[conn.user.jid];
  
  if (!text) throw `*الأوامر المتاحة:*\n\n${usedPrefix + command} on - تفعيل للكل (خاص)\n${usedPrefix + command} off - تعطيل للكل\n${usedPrefix + command} rtm [الرقم] - تصفير عداد مستخدم`;

  // --- تحديث أمر rtm (يظل كما هو مرتبط بـ yaemoriDB) ---
  if (text.startsWith("rtm")) {
    let target = text.split(" ")[1];
    
    if (!target) {
        target = m.sender;
    } else {
        target = target.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
    }
    
    if (global.yaemoriDB.users[target]) {
        global.yaemoriDB.users[target].count = 0; 
        let resp = target === m.sender ? "✅ تم تصفير عدادك بنجاح!" : `✅ تم تصفير العداد للرقم ${target}.`;
        m.reply(resp);
        global.yaemoriDB.save(); 
    } else {
        global.yaemoriDB.users[target] = { count: 0, lastReset: Date.now() };
        m.reply("✅ تم تصفير العداد (حساب جديد).");
        global.yaemoriDB.save();
    }
    return;
  }

  // التحكم في التفعيل العام عبر السيتينق
  if (text === "on") {
    settings.airesp = true;
    m.reply("✅ تم تفعيل ياموري للجميع في الخاص. ستظل مفعمة حتى بعد الريستارت.");
  } else if (text === "off") {
    settings.airesp = false;
    m.reply("❌ تم تعطيل ياموري للجميع.");
  }
};

handler.before = async (m, { conn }) => {
  // التحقق من حالة التفعيل في السيتينق الدائم
  let settings = global.db.data.settings[conn.user.jid];
  if (!settings || !settings.airesp) return;

  // شروط المنع (جروبات، بوتات، أوامر)
  if (m.isGroup || m.isBaileys || m.fromMe || !m.text || /^[.#/\\!]/.test(m.text)) return;

  const sender = m.sender;
  const name = m.pushName || "صديقي";
  const cleanQ = m.text.toLowerCase().trim();

  // إدارة العداد اليومي في قاعدة بيانات yaemoriDB
  global.yaemoriDB.users[sender] = global.yaemoriDB.users[sender] || { count: 0, lastReset: Date.now() };
  let user = global.yaemoriDB.users[sender];

  if (Date.now() - user.lastReset > 86400000) {
      user.count = 0;
      user.lastReset = Date.now();
  }

  if (user.count >= 10) {
      if (user.count === 10) {
          m.reply(`يا ${name}، وصلت للحد اليومي (10 رسائل).`);
          user.count++;
      }
      return;
  }

  let finalReply = "";

  try {
    finalReply = await gemini.ask(m.text, sender, name);
    const sanitizedA = finalReply.replace(new RegExp(name, 'gi'), "[USER]");
    global.yaemoriDB.qa[cleanQ] = global.yaemoriDB.qa[cleanQ] || [];
    if (!global.yaemoriDB.qa[cleanQ].includes(sanitizedA)) global.yaemoriDB.qa[cleanQ].push(sanitizedA);
  } catch (e) {
    if (global.yaemoriDB.qa[cleanQ]) {
        const randomA = global.yaemoriDB.qa[cleanQ][Math.floor(Math.random() * global.yaemoriDB.qa[cleanQ].length)];
        finalReply = randomA.replace(/\[USER\]/g, name);
    } else {
        return;
    }
  }

  global.yaemoriDB.history[sender] = global.yaemoriDB.history[sender] || [];
  global.yaemoriDB.history[sender].push({ q: m.text, a: finalReply });
  if (global.yaemoriDB.history[sender].length > 10) global.yaemoriDB.history[sender].shift();

  user.count++;
  await conn.reply(m.chat, finalReply, m);
  global.yaemoriDB.save();
};

handler.command = ["airesp"];
handler.owner = true;
handler.rowner = true;
export default handler;
