let Izumi = async (m, { conn, text }) => {
    if (!text.includes('x')) return m.reply('⚠️ Anda Masukan Link Twitter Dulu !');

    try {
        const { title, author, url,download } = await (await (await fetch(apikey.izumi + '/downloader/twitter?url=' + encodeURIComponent(text))).json()).result;

        for (let i = 0; i < download.length > 0; i++) {
            const buff = await (await fetch(download[i].url)).arrayBuffer();
            await conn.sendFile(m.chat, Buffer.from(buff), null, null, m);
        };
    } catch (e) {
        m.reply('❌ Maaf Error Mungkin lu kebanyakan request')
        console.error('Error', e)
    }
}

Izumi.command = ["x", "twitter"];
Izumi.help = ["x", "twitter"];
Izumi.tags = ["downloader"];
Izumi.limit = true;

export default Izumi;
