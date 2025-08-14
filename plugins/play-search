import yts from 'yt-search';

let handler = async (m, {
    conn,
    text
}) => {
    if (!text) return m.reply('⚠️ Masukan Judul Lagu Yang Anda Mau Cari!');
    try {
        const oks = await yts(text).then(a => a.all[0]);

        let caption = `╭───「 🔍 *Search Lagu Play* 」───
│  📌 *Title*: ${oks.title || 'No title'}
│  🆔 *Video ID*: ${oks.videoId || 'N/A'}
│  ⏳ *Uploaded*: ${oks.ago || 'Unknown'}
│  👤 *Channel*: ${oks.author?.name || 'Unknown'}
│  🔗 *URL*: ${oks.url || 'Not available'}
╰───────────────────────`;

        conn.telegram.sendPhoto(
            m.chat,
            oks.thumbnail, {
                caption,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{
                                text: '▶ Download MP4',
                                callback_data: `/ytmp4 ${oks.url}`
                            },
                            {
                                text: '▶ Download MP3',
                                callback_data: `/ytmp3 ${oks.url}`
                            }
                        ]
                    ]
                },
                reply_to_message_id: m.id
            }
        );

    } catch (e) {
        await m.reply('Maaf Mungkin Anda Kebanyakan Request ❌')
        await console.error('Error', e)
    }
}

handler.command = /^(play|music)$/i;
handler.help = ['play', 'music'];
handler.tags = ['search']

export default handler
