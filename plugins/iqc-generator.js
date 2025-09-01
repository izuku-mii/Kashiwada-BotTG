import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";

let Izumi = async (m, {
    conn,
    text
}) => {
    if (!text) return m.reply(' ⚠️ Masukan Teks Yang Mau iPhone Qc')
    if (text.length > 1000) return m.reply('⚠️ teks nya kepanjangan')
    try {
        const response = await axios.get("https://brat.siputzx.my.id/iphone-quoted", {
            params: {
                messageText: text,
                carrierName: ownername,
                batteryPercentage: "100",
                signalStrength: "3",
                emojiStyle: "apple",
            },
            responseType: "arraybuffer",
        });

        const tmpPath = path.join(os.tmpdir(), 'quoted_' + Date.now() + '.png');
        fs.writeFileSync(tmpPath, response.data);

        await conn.telegram.sendPhoto(m.chat, {
            source: tmpPath
        }, {
            reply_to_message_id: m.id,
        });

        fs.unlinkSync(tmpPath);
    } catch (e) {
        m.reply(' ❌ Maaf Error Mungkin lu kebanyakan request');
        console.log('Error', e);
    }
}

Izumi.command = /^(ipqc|iqc|iphone-quoted)$/i;
Izumi.help = ["ipqc", "iqc", "iphone-quoted"]
Izumi.tags = ["generator"]

export default Izumi;
