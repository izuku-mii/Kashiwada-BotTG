let Izumi = async (m, { conn }) => {

    let quoted = m.fakeObj.message.reply_to_message ? m.fakeObj.message.reply_to_message : m.fakeObj.message;

    const mediaTypes = ['photo']
    if (mediaTypes.every(type => !quoted[type])) {
        return m.reply('⚠️ Masukan Media (photo) Buat Di Hitamkan')
    };

    try {
        let fileId = quoted.photo[quoted.photo.length - 1].file_id;
        const {
            file_path
        } = await conn.telegram.getFile(fileId);
        let url = 'https://api.telegram.org/file/bot' + token + '/' + file_path;
        let response = await (await fetch(apikey.izumi + '/ai-image/hitamkan?imageUrl=' + encodeURIComponent(url))).json();
        const buffer = await (await fetch(response.result.download)).arrayBuffer();
        conn.telegram.sendPhoto(m.chat, {
            source: Buffer.from(buffer)
        }, {
            caption: '☘️ Nih Penghitaman Nya Tuan !',
            reply_to_message_id: m.id
        });
    } catch (e) {
        m.reply(' ❌ Maaf Error Mungkin lu kebanyakan request');
        console.error('Error', e);
    };
};

Izumi.command = ["hitam", "hytam", "hytamkan", "hitamkan"];
Izumi.help = ["hitam", "hytam", "hytamkan", "hitamkan"];
Izumi.tags = ["tools"]

export default Izumi;
