let izumi = async (m, { conn, text }) => {
    let quoted = m.fakeObj.message.reply_to_message ? m.fakeObj.message.reply_to_message : m.fakeObj.message;

    if (!(quoted?.photo)) {
        return m.reply('⚠️Kirim Foto/Reply Foto Mau Di Hdkan!');
    };

    const fileId = quoted.photo[quoted.photo.length - 1].file_id;
    const {
        file_path
    } = await conn.telegram.getFile(fileId);

    const url = `https://api.telegram.org/file/bot${token}/${file_path}`;

    try {
        // Result Upscale 1x Nya
        const { result: x2 } = await (await fetch(global?.apikey?.izumi + '/tools/upscale?imageUrl=' + encodeURIComponent(url))).json();

        // Result Upscale 2x Nya
        const { result } = await (await fetch(global?.apikey?.izumi + '/tools/upscale?imageUrl=' + encodeURIComponent(x2.imageUrl))).json();

        await conn.sendMessage(m.chat, {
            image: {
                url: result.imageUrl
            },
            caption: ' ✅ Selesai Tapi, 2x Upscale Nya'
        }, {
            quoted: {
                message_id: m.id
            }
        });
    } catch (e) {
        await m.reply(' ❌ Maaf Error Mungkin Lu Kebanyakan Request');
        await console.error('Error', e);
    };
};

izumi.command = /^(remini|hd|hdr)$/i;
izumi.help = ['remini', 'hd', 'hdr'];
izumi.tags = ['tools']

export default izumi;
