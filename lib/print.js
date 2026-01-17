import chalk from "chalk";

export default async function (m, conn = {}, chatUpdate, isOwner, isResponded) {
  if (!m || !m.mtype || ['protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) return;

  let from = m.isGroup ? (await conn.getName(m.chat) || "Group") : "Private Chat";
  let name = m.name || m.sender.split('@')[0];
  let user = global.db?.data?.users?.[m.sender] || { exp: 0, level: 0 };
  
  let txt = m.text || (m.msg && m.msg.caption) || "";
  txt = txt.length > 80 ? txt.slice(0, 77) + "..." : txt;

  // --- تعريف الألوان العميقة باستخدام نظام ANSI 256 ---
  const deepBlue = chalk.ansi256(21).bold;     // أزرق ملكي شديد الزرقة
  const deepGreenBg = chalk.bgAnsi256(22).white.bold; // أخضر غامق جداً (خلفية)
  const deepRedBg = chalk.bgAnsi256(88).white.bold;   // أحمر داكن جداً (خلفية)

  let logMessage = `
${deepBlue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}
     ${chalk.white.bold("📌 CHAT INFORMATION")}
${deepBlue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}

📝 ${chalk.white.bold("TYPE      :")} ${m.isGroup ? "🟢 GROUP CHAT" : "🔵 PRIVATE CHAT"}
👤 ${chalk.white.bold("FROM      :")} ${from}
📞 ${chalk.white.bold("USER      :")} ${name}
🤖 ${chalk.white.bold("CHATBOT   :")} ${isResponded === "YES" ? deepGreenBg(" YES ") : deepRedBg(" NO ")}
🔌 ${chalk.white.bold("PLUGIN    :")} ${m.plugin || "None"}

🎯 ${chalk.white.bold("EXP       :")} ${user.exp}
📊 ${chalk.white.bold("LEVEL     :")} ${user.level}
🗂️ ${chalk.white.bold("MIMETYPE  :")} ${chalk.black.bgWhite(" " + m.mtype.toUpperCase() + " ")}
👑 ${chalk.white.bold("OWNER     :")} ${isOwner ? deepGreenBg(" YES ") : deepRedBg(" NO ")}

${deepBlue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}

${chalk.whiteBright.bold(" ➤ " + txt)}

${deepBlue("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}

💻 ${chalk.white.bold("YAEMORI SYSTEM ACTIVE")}
`;

  console.log(logMessage);
}
