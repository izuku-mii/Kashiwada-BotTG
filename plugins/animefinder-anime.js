import axios from 'axios'

let izumi = async (m, { conn }) => {
    let quoted = m.fakeObj.message.reply_to_message ? m.fakeObj.message.reply_to_message : m.fakeObj.message;

    if (!(quoted?.photo)) {
        return m.reply('⚠️Masukan Media (Photo) Untuk Buat Cari Anime');
    };

    let fileId
    if (quoted.photo) {
        fileId = quoted.photo[quoted.photo.length - 1].file_id;
    } else if (quoted.text) {
        return;
    }

    try {
        const { file_path } = await conn.telegram.getFile(fileId);

        const url = `https://api.telegram.org/file/bot${token}/${file_path}`;
        const response = await axios.get(apikey.izumi + '/anime/animefinder?url=' + url);

        const { result: finder } = response.data
        let cap = `╭───「 🍀AnimeFinder 」───
│  📙 Judul: ${finder.animeTitle || 'Null'}
│  👤 Karakter: ${finder.character || 'Null'}
│  🧩 Genre: ${finder.genres || 'Null'}
╰───────────────────────
╭───「 🔗References 」───
${finder.references.map(a => `│  🌐 Site: ${a.site || 'Null'}
│  🔗 Url: ${a.url || 'Null'}`).join("\n")}
╰───────────────────────`;

        await conn.telegram.sendMessage(m.chat, cap, {
            parse_mode: 'Markdown',
            reply_to_message_id: m.id
        });
    } catch (e) {
        await m.reply(' ❌ Maaf Error Mungkin Lu Kebanyakan Request');
        console.error('Error', e);
    };
};

izumi.command = /^(animefinder)$/i;
izumi.help = ["animefinder"];
izumi.tags = ["anime"];

export default izumi;
