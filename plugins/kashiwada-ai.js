import upload from '../lib/uploader.js'
import axios from "axios";

let o7ta = async (m, {
    conn,
    text
}) => {
    try {
        if (!text) return m.reply('Hai! Aku Kashiwada-san Di sini');
        let quoted = m.fakeObj.message.reply_to_message ? m.fakeObj.message.reply_to_message : m.fakeObj.message;

        let query;
        if (quoted.photo) {
            let fileId = quoted.photo[quoted.photo.length - 1].file_id;
            const {
                file_path
            } = await conn.telegram.getFile(fileId);
            const url = 'https://api.telegram.org/file/bot' + token + '/' + file_path;
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            });
            const tou = await upload.tempfiles(response.data);
            query = new URLSearchParams({
                message: text,
                imageUrl: tou
            }).toString();
        } else {
            query = new URLSearchParams({
                message: text
            }).toString();
        }

        const url = 'https://izumiiiiiiii.dpdns.org/character/kashiwada-san?' + query;

        const params = {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        };

        const response = await fetch(url, params);
        const result = await response.json();

        m.reply(result.message)
    } catch (_e) {
        await m.reply(' ❌ Maaf Error Mungkin lu kebanyakan request!');
        console.error(_e)
    }
}

o7ta.help = ["kashiwada-san", "kashiwada"];
o7ta.command = ["kashiwada-san", "kashiwada"];
o7ta.tags = ["ai"];

export default o7ta;
