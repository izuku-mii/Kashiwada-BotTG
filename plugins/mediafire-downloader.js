import file from 'file-type';

let Izumi = async (m, { conn, text }) => {
    if (!text.includes('mediafire')) return m.reply('⚠️ Mana Link MediaFire Nya !');
    try {
        const {
            result: mf
        } = await (await fetch('https://api.nekolabs.my.id/downloader/mediafire?url=' + text)).json();
        const buf = await (await fetch(mf.download_url)).arrayBuffer();
        const buffer = Buffer.from(buf);
        const {
            mime
        } = await file.fromBuffer(buffer);

        let capmf = ' 📁 ---[ Downloader MediaFire ]--- 📂 \n'
        capmf += ' -(Filename)-: %filename\n'
        capmf += ' -(Size)-: %size\n';
        capmf += ' -(mimetype)-: %mimetype\n';
        capmf += ' -(uploaded)-: %uploaded\n';
        capmf += ' -(Link)-: %link';

        let mfcap = capmf
            .replace(/%filename/g, mf.filename)
            .replace(/%size/g, mf.filesize)
            .replace(/%mimetype/g, mime)
            .replace(/%uploaded/g, mf.uploaded)
            .replace(/%link/g, mf.download_url)

        conn.telegram.sendDocument(m.chat, {
            source: buffer,
            filename: mf.filename
        }, {
            caption: mfcap,
            reply_to_message_id: m.id
        });
    } catch (e) {
        m.reply(' ❌ Maaf Error Mungkin lu kebanyakan request');
        console.error('Error', e);
    };
};

Izumi.command = /^(mediafire|mf|mfdl)$/i;
Izumi.help = ["mediafire", "mf", "mfdl"];
Izumi.tags = ["downloader"];

export default Izumi;
