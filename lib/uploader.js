import fetch from 'node-fetch';
import FormData from 'form-data';
import fileType from 'file-type';
import axios from 'axios';
import fs from 'fs';
import chalk from 'chalk';

const file = async (buffer) => {
    const { ext } = await fileType.fromBuffer(buffer);
    const filename = 'izumi-' + Date.now() + '.' + ext;
    return filename;
};

export default {
    abel: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = await file(buffer);
                const data = new FormData();
                data.append('file', buffer, {
                    filename
                });

                const response = await axios.post("https://cnd.abella.icu/upload", data, {
                    headers: {
                        ...data.getHeaders(),
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
                        "Referer": "https://cnd.abella.icu/",
                    },
                });

                resolve(response.data);
            } catch (err) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', err.message);
            }
        });
    },

    catbox: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = await file(buffer);
                const data = new FormData();
                data.append('reqtype', 'fileupload');
                data.append('userhash', '');
                data.append('fileToUpload', buffer, {
                    filename
                });

                const api = await axios.post('https://catbox.moe/user/api.php', data, {
                    headers: {
                        ...data.getHeaders(),
                        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0'
                    }
                });

                resolve(api.data);
            } catch (err) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', err);
            }
        });
    }
}


const filee = new URL(import.meta.url);
fs.watchFile(filee, () => {
    fs.unwatchFile(filee);
    console.log(chalk.redBright(`Update 'uploader.js'`));
});
