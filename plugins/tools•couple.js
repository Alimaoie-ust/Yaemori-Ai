import axios from 'axios';

const DATA_URL = 'https://github.com/rikikangsc2-eng/metadata/raw/refs/heads/main/couple.json';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn }) => {
  // استخدام rcanal في الرد النصي الأول
  await conn.reply(m.chat, '📸 جاري البحث عن صور ثنائية مناسبة لك... 💑', m, global.rcanal);

  try {
    const { data: coupleList } = await axios.get(DATA_URL);

    if (!coupleList || !Array.isArray(coupleList) || coupleList.length === 0) {
      throw '⚠️ لم يتم العثور على بيانات صالحة.';
    }

    const couple = coupleList[Math.floor(Math.random() * coupleList.length)];

    const [maleResponse, femaleResponse] = await Promise.all([
      axios.get(couple.male, { responseType: 'arraybuffer', timeout: 30000 }),
      axios.get(couple.female, { responseType: 'arraybuffer', timeout: 30000 })
    ]);

    // إضافة rcanal للصور عبر contextInfo
    await conn.sendMessage(m.chat, { 
        image: maleResponse.data, 
        caption: '👦 صورة الشاب',
        contextInfo: global.rcanal.contextInfo 
    }, { quoted: m });

    await delay(300);

    await conn.sendMessage(m.chat, { 
        image: femaleResponse.data, 
        caption: '👧 صورة الفتاة',
        contextInfo: global.rcanal.contextInfo 
    }, { quoted: m });

  } catch (e) {
    console.error('❌ خطأ أثناء جلب صور الثنائي:', e);
    await conn.reply(m.chat, '⚠️ حدث خطأ أثناء جلب الصور.', m, global.rcanal);
  }
};

handler.help = ['couple'];
handler.tags = ['tools'];
handler.command = ['couple'];
handler.limit = true;
export default handler;
