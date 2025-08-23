import jsbe from 'js-beautify';
import {
    Readable
} from 'stream';

const html = jsbe.html;

function replyChunked(m, text, limit = 4000) {
    if (!text) return;
    for (let i = 0; i < text.length; i += limit) {
        let chunk = text.substring(i, i + limit);
        m.reply(chunk);
    };
};

let izumi = async (m, { conn, text }) => {
    if (!text.includes('https')) return m.reply(' ⚠️ Masukan Link Nya !');
    const response = await fetch(text);
    const mime = response.headers.get('content-type').split(';')[0];

    let body;
    if (/html/.test(mime)) {
        body = await response.text();
        const resht = html(body);

        const stream = Readable.from([resht]);
        conn.telegram.sendDocument(m.chat, {
            source: Buffer.from(resht),
            filename: "result.html",
        }, {
            caption: '✅Get Html',
            reply_to_message_id: m.id
        });
    } else if (/audio/.test(mime)) {
        body = await response.arrayBuffer()
        await conn.telegram.sendAudio(m.chat, {
            source: Buffer.from(body),
            filename: "result.mp3",
        }, {
            caption: '✅Get Audio',
            reply_to_message_id: m.id
        });
    } else if (/video/.test(mime)) {
        body = await response.arrayBuffer()
        await conn.telegram.sendVideo(m.chat, {
            source: Buffer.from(body),
            filename: "result.mp4",
        }, {
            caption: '✅Get Video',
            reply_to_message_id: m.id
        });
    } else if (/image/.test(mime)) {
        body = await response.arrayBuffer()
        await conn.telegram.sendPhoto(m.chat, {
            source: Buffer.from(body),
            filename: "result.jpg",
        }, {
            caption: '✅Get Photo',
            reply_to_message_id: m.id
        });
    } else if (/json/.test(mime)) {
        body = await response.json()
        await replyChunked(m, JSON.stringify(body, null, 2));
    } else {
        m.reply(' ❌ Maaf Mungkin Link Yang Di Fetch Gabisa :v');
    };
};

izumi.command = /^(get|fetching)$/i
izumi.help = ["get", "fetch"];
izumi.tags = ["tools"];
izumi.limit = true;

export default izumi;
