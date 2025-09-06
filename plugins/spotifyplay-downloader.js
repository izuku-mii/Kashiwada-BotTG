// npm i canvafy

import canvafy from 'canvafy';

let Izumi = async (m, { conn, text }) => {
    if (!text) return m.reply(' ⚠️ Masukan Nama Lagu Nya Sek')
    try {
        const { result: splay } = await (await fetch('https://izumiiiiiiii.dpdns.org/downloader/spotifyplay?q=' + text)).json()

        const spotify = await new canvafy.Spotify()
            .setAuthor(splay.artists)
            .setAlbum(splay.album)
            .setTimestamp(splay.duration_ms, 263400)
            .setImage(splay.image)
            .setTitle(splay.title)
            .setBlur(5)
            .setOverlayOpacity(0.7)
            .build();

        let capsp = ' 🎧 --( Play Spotify )-- 🎵\n';
        capsp += ' -(Title)-: %title\n';
        capsp += ' -(Author)-: %author\n';
        capsp += ' -(Release)-: %release\n';
        capsp += ' -(Url)-: %url';

        let caption = capsp
            .replace(/%title/g, splay.title)
            .replace(/%author/g, splay.artists)
            .replace(/%release/g, splay.release_date)
            .replace(/%url/g, splay.external_url)

        await conn.telegram.sendPhoto(m.chat, {
            source: spotify
        }, {
            caption,
            reply_to_message_id: m.id
        });
        const audio = await (await fetch(splay.download)).arrayBuffer();
        const audioBuffer = Buffer.from(audio);

        await conn.telegram.sendAudio(m.chat, {
            source: audioBuffer
        }, {
            caption,
            reply_to_message_id: m.id
        });
    } catch (e) {
        m.reply(' ❌ Maaf Error Mungkin lu kebanyakan request')
        console.error('Error', e)
    };
};

Izumi.command = /^(spotifyplay|splay)$/i;
Izumi.help = ["spotify", "splay"];
Izumi.tags = ["downloader"];

export default Izumi;
