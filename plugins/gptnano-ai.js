let izumi = async (m, { conn, text }) => {
    if (!text) return m.reply(' ⚠️ Masukan Teks Yang Ingin di tanyakan');
    let quoted = m.fakeObj.message.reply_to_message ? m.fakeObj.message.reply_to_message : m.fakeObj.message;

    try {
        let response;
        if (quoted.photo) {
            const fileId = quoted.photo[quoted.photo.length - 1].file_id;
            const { file_path } = await conn.telegram.getFile(fileId);
            const url = `https://api.telegram.org/file/bot${token}/${file_path}`;
            response = await (await fetch(`${apikey.izumi}/ai/gptnano?prompt=${text}&imageUrl=${url}`)).json();
        } else {
            response = await (await fetch(`${apikey.izumi}/ai/gptnano?prompt=${text}`)).json();
        };

        m.reply(response.result);
    } catch (e) {
        m.reply('❌ Maaf Error Mungkin Lu Kebanyakan Request')
    };
};

izumi.command = /^(gptnano)$/i;
izumi.help = ['gptnano'];
izumi.tags = ['ai'];

izumi.limit = true;

export default izumi;
