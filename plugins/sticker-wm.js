import {addExif} from '../lib/sticker.js';

const handler = async (m, {conn, text}) => {
  if (!m.quoted) throw '*[❗ معلومة ❗] قم بالرد على الملصق الذي تريد تغيير حقوقه واكتب اسم الحزمة واسم المبدع*';
  
  let stiker = false;
  try {
    let [packname, ...author] = text.split('|');
    author = (author || []).join('|');
    const mime = m.quoted.mimetype || '';
    
    if (!/webp/.test(mime)) throw '*[❗ معلومة ❗] يجب عليك الرد على ملصق (Sticker) فقط*';
    
    const img = await m.quoted.download();
    if (!img) throw '*[❗ معلومة ❗] فشل تحميل الملصق، حاول مرة أخرى*';
    
    // تغيير الحقوق (Exif)
    stiker = await addExif(img, packname || global.packsticker, author || global.author);
  } catch (e) {
    console.error(e);
    if (Buffer.isBuffer(e)) stiker = e;
  } finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, {asSticker: true});
    } else {
      throw '*[❗ خطأ ❗] عذراً، حدث خطأ ما.. تأكد من الرد على ملصق وإدخال اسم الحزمة والمؤلف بشكل صحيح*';
    }
  }
};

handler.help = ['wm <packname>|<author>'];
handler.arabic = ['حقوق <اسم الحزمة>|<المؤلف>']; // الإضافة المطلوبة
handler.tags = ['sticker'];
handler.group = true;
handler.register = true;
handler.command = ['take', 'wm', 'سرقة', 'حقوق']; // إضافة أوامر بالعربية

export default handler;
