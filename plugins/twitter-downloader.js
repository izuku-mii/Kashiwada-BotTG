let Izumi = async (m, { conn, text }) => {
    if (!text.includes('x') || !text.includes('t')) return m.reply(' ⚠️ Masukan Link Twitter Nya !');
    try {
        const tw = await (
            await fetch(
                'https://izumiiiiiiii.dpdns.org/downloader/twitter?url=' + encodeURIComponent(text)
            )
        ).json();

        const image = tw.result.filter(x => x.type === 'image');
        const gif = tw.result.filter(x => x.resolution === 'gif');
        const video = tw.result.filter(x => x.type === 'video');

        if (image.length > 0) {
            for (let i = 0; i < image.length; i++) {
                const buffer = await (await fetch(image[i].link)).arrayBuffer();
                await conn.telegram.sendPhoto(
                    m.chat, {
                        source: Buffer.from(buffer)
                    }, {
                        caption: 'Slide: ' + (i + 1) + '/' + image.length,
                        reply_to_message_id: m.id
                    }
                );
            }
        } else if (gif.length > 0) {
            const buffer = await (await fetch(gif[0].link)).arrayBuffer();
            await conn.telegram.sendVideo(
                m.chat, {
                    source: Buffer.from(buffer)
                }, {
                    caption: 'Nih GIF videonya :v',
                    reply_to_message_id: m.id
                }
            );
        } else if (video.length > 0) {
            const buffer = await (await fetch(video[0].link || video[1].link)).arrayBuffer();
            await conn.telegram.sendVideo(
                m.chat, {
                    source: Buffer.from(buffer)
                }, {
                    caption: 'Nih videonya :v',
                    reply_to_message_id: m.id
                }
            );
        } else {
            await conn.telegram.sendMessage(m.chat, {
                text: '⚠️ Tidak ada media yang bisa diunduh',
                reply_to_message_id: m.id
            });
        };
    } catch (e) {
        m.reply(' ❌ Maaf Error Mungkin lu kebanyakan request');
        console.error('Error', e);
    };
};

Izumi.command = /^(x|twitter)$/i;
Izumi.help = ["x", "Twitter"];
Izumi.tags = ["downloader"]

export default Izumi;
