import axios from "axios";

let Izumi = async (m, {
    conn,
    text,
    command
}) => {
    try {
        switch (command) {
            case "ytmp4": {
                if (!text.includes('youtu')) return m.reply('⚠️ Masukan Link YouTube Sama Format !')
                let [link, format] = text.split(' ')
                const f = format || "720"
                const quality = ['360', '720', '1080']
                if (!quality.includes(f)) return m.reply(' ⚠️Quality Tersedia Hanya: ' + format.video.map((a => a)).join(', '))
                const params = new URLSearchParams({
                    url: link,
                    format: f
                });
                let resp = await (await fetch(apikey.izumi + '/downloader/youtube?' + params)).json()

                const yt = resp.result;
                let ytcap = ' ------- ( DOWNLOADER - YOUTUBE ) -------\n'
                ytcap += ' -(TITLE)-: %title\n'
                ytcap += ' -(AUTHOR)-: %author\n'
                ytcap += ' -(UPLOADED)-: %uploaded\n'
                ytcap += ' -(URL)-: %link\n\n'
                ytcap += ' -(LIKE)-: %like, -(COMMENT)-: %comment, -(DURATION)-: %duration'

                let caption = ytcap
                    .replace(/%title/g, yt.title || '')
                    .replace(/%author/g, yt.author.channelTitle || '')
                    .replace(/%uploaded/g, yt.metadata.jadwal_upload || '')
                    .replace(/%link/g, yt.url || '')
                    .replace(/%like/g, yt.metadata.like || '')
                    .replace(/%comment/g, yt.metadata.comment || '')
                    .replace(/%duration/g, yt.metadata.duration || '')

                const thumbnail = await axios.get(yt.thumbnail, { responseType: 'arraybuffer' });
                const reply = await conn.telegram.sendPhoto(m.chat, {
                    source: thumbnail.data,
                    filename: 'thumbnail.jpg'
                }, {
                    caption,
                    reply_to_message_id: m.id
                });

                const buffer = await axios.get(yt.download, { responseType: 'arraybuffer' });
                if (buffer.data.length > 1024 * 1024 * 100) {
                    await conn.telegram.sendDocument(m.chat, {
                        source: buffer.data,
                        filename: yt.title + '.mp4',
                    }, {
                        caption,
                        reply_to_message_id: reply.id
                    });
                } else {
                    await conn.telegram.sendVideo(m.chat, {
                        source: buffer.data,
                        filename: yt.title + '.mp4',
                    }, {
                        caption,
                        reply_to_message_id: reply.id
                    });
                }
            }
            break;
            case "ytmp3": {
                if (!text.includes('youtu')) return m.reply('⚠️ Masukan Link Youtube')
                const params = new URLSearchParams({
                    url: text,
                    format: 'mp3'
                });
                let resp = await (await fetch(apikey.izumi + '/downloader/youtube?' + params)).json()

                const yt = resp.result;
                let ytcap = ' ------- ( DOWNLOADER - YOUTUBE ) -------\n'
                ytcap += ' -(TITLE)-: %title\n'
                ytcap += ' -(AUTHOR)-: %author\n'
                ytcap += ' -(UPLOADED)-: %uploaded\n'
                ytcap += ' -(URL)-: %link\n\n'
                ytcap += ' -(LIKE)-: %like, -(COMMENT)-: %comment, -(DURATION)-: %duration'

                let caption = ytcap
                    .replace(/%title/g, yt.title || '')
                    .replace(/%author/g, yt.author.channelTitle || '')
                    .replace(/%uploaded/g, yt.metadata.jadwal_upload || '')
                    .replace(/%link/g, yt.url || '')
                    .replace(/%like/g, yt.metadata.like || '')
                    .replace(/%comment/g, yt.metadata.comment || '')
                    .replace(/%duration/g, yt.metadata.duration || '')

                const thumbnail = await axios.get(yt.thumbnail, { responseType: 'arraybuffer' });
                const reply = await conn.telegram.sendPhoto(m.chat, {
                    source: thumbnail.data,
                    filename: 'thumbnail.jpg'
                }, {
                    caption,
                    reply_to_message_id: m.id
                });

                const buffer = await axios.get(yt.download, { responseType: 'arraybuffer' });
                if (buffer.data.length > 1024 * 1024 * 100) {
                    await conn.telegram.sendDocument(m.chat, {
                        source: buffer.data,
                        filename: yt.title + '.mp3',
                    }, {
                        caption,
                        reply_to_message_id: reply.id
                    });
                } else {
                    await conn.telegram.sendAudio(m.chat, {
                        source: buffer.data,
                        filename: yt.title + '.mp3',
                    }, {
                        caption,
                        reply_to_message_id: reply.id
                    });
                }
            }
            break;
        };
    } catch (e) {
        m.reply(' ❌ Maaf Error Mungkin lu kebanyakan request');
        console.error('Error', e);
    };
};

Izumi.command = /^(ytmp4|ytmp3)$/i
Izumi.help = ["ytmp4", "ytmp3"];
Izumi.tags = ["downloader"];

export default Izumi;
