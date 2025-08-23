function pickRandom(arr, n) {
    const copy = [...arr];
    const result = [];
    for (let i = 0; i < n && copy.length > 0; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let izumi = async (m, {
    conn,
    text
}) => {
    if (!text) return m.reply(' ⚠️ Masukan Nama Gambar Yang Mau di Cari');

    try {
        const { result } = await (await fetch('https://izumiiiiiiii.dpdns.org/search/pinterest?query=' + text)).json();
        const foto = pickRandom(result.pins, 5);

        const loadingMsg = await conn.telegram.sendMessage(m.chat, "🔎 Gambar Lagi Di Cari", {
            reply_to_message_id: m.id
        });

        await delay(2000);
        const edit = await conn.telegram.editMessageText(
            m.chat,
            loadingMsg.message_id,
            undefined,
            "✅ Ditemukan 5 random gambar " + text, {
                reply_to_message_id: m.id
            }
        );
        
        await delay(5000);
        await conn.telegram.deleteMessage(m.chat, edit.message_id);

        for (let i = 0; i < foto.length > 0; i++) {
            await conn.sendMessage(m.chat, {
                image: {
                    url: foto[i].media.images.large.url
                },
                caption: foto[i].title + ' / ' + foto[i].description + '\n\n🧩Link: ' + foto[i].pin_url
            }, {
                quoted: {
                    message_id: m.id
                }
            });
        };
    } catch (e) {
        m.reply(' ❌ Maaf Error Mungkin Lu Kebanyakan Request');
        console.error('Error', e);
    };
};

izumi.command = /^(pinterest|pin)$/i;
izumi.help = ["pinterest", "pin"];
izumi.tags = ["internet"];
izumi.limit = true;

export default izumi;
