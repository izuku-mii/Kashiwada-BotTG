import axios from 'axios';

let izumi = async (m, { conn, text }) => {
    if (!text.includes('https://')) return m.reply(' ⚠️ Mana Link Web Nya Buat Ss');
    try {
        const result = await ssweb(text);
        await conn.sendMessage(m.chat, {
            image: {
                url: result
            },
            caption: ' ✅ Done Nih Ss Web Nya'
        }, {
            quoted: {
                message_id: m.id
            }
        });
    } catch (e) {
        m.reply(' ❌ Maaf Error Mungkin Lu Kebanyakan Request');
        console.error('Error', e);
    };
};

izumi.command = /^(ssweb)$/i;
izumi.help = ['ssweb']
izumi.tags = ['tools']

export default izumi;

async function ssweb(url, { width = 1280, height = 720, full_page = false, device_scale = 1 } = {}) {
    try {
        if (!url.startsWith('https://')) throw new Error('Invalid url');
        if (isNaN(width) || isNaN(height) || isNaN(device_scale)) throw new Error('Width, height, and scale must be a number');
        if (typeof full_page !== 'boolean') throw new Error('Full page must be a boolean');
        
        const { data } = await axios.post('https://gcp.imagy.app/screenshot/createscreenshot', {
            url: url,
            browserWidth: parseInt(width),
            browserHeight: parseInt(height),
            fullPage: full_page,
            deviceScaleFactor: parseInt(device_scale),
            format: 'png'
        }, {
            headers: {
                'content-type': 'application/json',
                referer: 'https://imagy.app/full-page-screenshot-taker/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });
        
        return data.fileUrl;
    } catch (error) {
        throw new Error(error.message);
    }
}
