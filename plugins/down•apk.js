// ALI_MD // TESTING // MODIFIED BY YAEMORI AI
let handler = async (m, { conn, usedPrefix, command, text }) => {
  conn.apk = conn.apk ? conn.apk : {};

  // حالة التحميل (عند اختيار رقم من القائمة)
  if (text && !isNaN(text) && m.sender in conn.apk) {
    let dt = conn.apk[m.sender];
    let index = parseInt(text) - 1;

    if (!dt.data[index]) return conn.reply(m.chat, "⚠️ رقم التطبيق غير موجود في القائمة!", m, global.rcanal);
    if (dt.download) return conn.reply(m.chat, "⏳ عملية تحميل أخرى جارية بالفعل، يرجى الانتظار...", m, global.rcanal);

    try {
      dt.download = true;
      await m.react('📥');
      let data = await aptoide.download(dt.data[index].id);
      
      let caption = `*📦 تفاصيل التطبيق:*\n\n` +
                    `*• الاسم:* ${data.appname}\n` +
                    `*• المطور:* ${data.developer}\n\n` +
                    `🚀 جاري إرسال الملف، يرجى الانتظار...`.trim();

      await conn.sendMessage(m.chat, { image: { url: data.img }, caption: caption, ...global.rcanal }, { quoted: m });

      let dl = await conn.getFile(data.link);
      await conn.sendMessage(m.chat, {
        document: dl.data,
        fileName: data.appname + ".apk",
        mimetype: 'application/vnd.android.package-archive',
        ...global.rcanal
      }, { quoted: m });
      
      await m.react('✅');
    } catch (e) {
      console.error(e);
      conn.reply(m.chat, "❌ حدث خطأ أثناء تحميل ملف الـ APK.", m, global.rcanal);
    } finally {
      dt.download = false;
    }
    return;
  }

  // حالة البحث
  if (!text) return conn.reply(m.chat, `*⚠️ يرجى كتابة اسم التطبيق بعد الأمر*\n\n*مثال:* ${usedPrefix + command} facebook`, m, global.rcanal);

  await m.react('🔍');
  let data = await aptoide.search(text);

  if (!data || data.length === 0) {
    return conn.reply(m.chat, "❌ لم يتم العثور على نتائج لهذا البحث.", m, global.rcanal);
  }

  let rows = data.map((v, i) => ({
    title: `${i + 1}. ${v.name}`,
    description: `📥 الحجم: ${v.size} | الإصدار: ${v.version}`,
    id: `${usedPrefix + command} ${i + 1}`
  }));

  const msg = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: { text: `*🎮 نتائج البحث عن: ${text}*\n\nيرجى اختيار التطبيق الذي تود تحميله من القائمة أدناه.` },
          footer: { text: 'Yaemori APK Downloader' },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '📱 اختر التطبيق',
                  sections: [{ title: 'النتائج المتوفرة', rows }]
                })
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '📢 قناة المطور',
                  url: 'https://whatsapp.com/channel/0029VbBq99KBlHpjaWQsPF2J'
                })
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '📸 إنستغرام المطور',
                  url: 'https://www.instagram.com/ali_progs?igsh=MWdsdXFnYXY3NWZxNw=='
                })
              }
            ]
          },
          contextInfo: global.rcanal.contextInfo
        }
      }
    }
  };

  await conn.relayMessage(m.chat, msg, {});

  conn.apk[m.sender] = {
    download: false,
    data: data,
    time: setTimeout(() => {
      delete conn.apk[m.sender];
    }, 600000)
  };
};

handler.help = ["apk"];
handler.arabic = ['تطبيق'];
handler.tags = ["downloader"];
handler.command = /^(apk|تطبيق)$/i;
handler.limit = true;

export default handler;

const aptoide = {
  search: async function (args) {
    let res = await global.fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(args)}&limit=15`);
    res = await res.json();
    if (!res.datalist || !res.datalist.list) return [];
    return res.datalist.list.map((v) => ({
      name: v.name,
      size: (v.size / (1024 * 1024)).toFixed(2) + " MB",
      version: v.file?.vername || 'N/A',
      id: v.package,
      download: v.stats?.downloads || 0,
    }));
  },
  download: async function (id) {
    let res = await global.fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`);
    res = await res.json();
    const app = res.datalist.list[0];
    return {
      img: app.icon,
      developer: app.store?.name || 'غير معروف',
      appname: app.name,
      link: app.file?.path,
    };
  },
};
