import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const codeToExplain = m.quoted?.text || text;
    if (!codeToExplain) return conn.reply(m.chat, `يرجى تقديم الكود المراد شرحه.\nمثال:\n${usedPrefix + command} console.log("Hi")`, m, global.rcanal);

    try {
        await conn.reply(m.chat, '🤔 جاري تحليل الكود... انتظر قليلاً.', m, global.rcanal);
        const { data } = await axios.post('https://whatdoesthiscodedo.com/api/stream-text', { 
            code: codeToExplain 
        }, { 
            headers: { 'content-type': 'application/json' } 
        });
        
        if (data) {
            const explanation = `💻 *شرح الكود:*\n\n\`\`\`\n${codeToExplain}\n\`\`\`\n\n📝 *التفسير:*\n${data}`;
            await conn.reply(m.chat, explanation, m, global.rcanal);
        } else {
            throw new Error('API returned empty');
        }
    } catch (error) {
        console.error(error);
        await conn.reply(m.chat, `حدث خطأ: ${error.message}`, m, global.rcanal);
    }
};

handler.help = ['explaincode'];
handler.command = ['explaincode'];
handler.tags = ['tools'];
handler.limit = true;

export default handler;
