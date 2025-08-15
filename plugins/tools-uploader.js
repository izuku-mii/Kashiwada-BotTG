import axios from 'axios'
import { uploadPermanent } from 'cloudku-uploader'

let izumi = async (m, { conn }) => {
    let quoted = m.fakeObj.message.reply_to_message ? m.fakeObj.message.reply_to_message : m.fakeObj.message;

    if (!(quoted?.photo || quoted?.document || quoted?.video || quoted?.audio || quoted?.voice)) {
        return m.reply('⚠️Masukan Media (photo/document/video/audio/voice) Buat Di Upload');
    };

    let fileId
    if (quoted.photo) {
        fileId = quoted.photo[quoted.photo.length - 1].file_id;
    } else if (quoted.document) {
        fileId = quoted.document.file_id;
    } else if (quoted.video) {
        fileId = quoted.video.file_id;
    } else if (quoted.audio) {
        fileId = quoted.audio.file_id;
    } else if (quoted.voice) {
        fileId = quoted.voice.file_id;
    } else if (quoted.text) {
        return;
    }

    try {
        const { file_path } = await conn.telegram.getFile(fileId);

        const url = `https://api.telegram.org/file/bot${token}/${file_path}`;
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });

        const { data: to } = await uploadPermanent(response.data);
        let cap = `╭───「 ⬆️ Uploader Media 」───
│  📁 Filename: ${to.filename || 'Null'}
│  🗄️ Size: ${to.size || 'Null'}
│  🔗 Url: ${to.url || 'Null'}
╰───────────────────────`;

        await conn.telegram.sendMessage(m.chat, cap, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🔗 Web Uploader',
                        url: 'https://cloudkuimages.guru'
                    }]
                ]
            },
            reply_to_message_id: m.id
        });
    } catch (e) {
        await m.reply(' ❌ Maaf Error Mungkin Lu Kebanyakan Request');
        console.error('Error', e);
    };
};

izumi.command = /^(tourl|touploader)$/i;
izumi.help = ["tourl", "touploader"];
izumi.tags = ["tools"];

export default izumi;
