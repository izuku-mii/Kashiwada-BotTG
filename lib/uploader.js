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
    ypnk: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = await file(buffer);
                const data = new FormData();
                data.append('files', buffer, {
                    filename
                });
                
                const response = await axios.post('https://cdn.ypnk.biz.id/upload', data, {
                    headers: {
                        ...data.getHeaders(),
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
                        "Referer": "https://cdn.ypnk.biz.id/"
                    }
                });
                
                resolve('https://cdn.ypnk.biz.id' + response.data.files[0].url);
            } catch (err) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', err);
            };
        });
    },

    cloudku: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = await file(buffer);
                const data = new FormData();
                data.append('file', buffer, {
                    filename
                });
                
                const response = await axios.post('https://www.cloudkuimages.guru/upload', data, {
                    headers: {
                        ...data.getHeaders(),
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
                        "Referer": "https://www.cloudkuimages.guru/"
                    }
                });
            } catch (err) {
                reject({
                    msg: 'Gomene Error Tourl'
                });
                console.error('Error', err);
            };
        });
    },

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
    },

    uguu: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = await file(buffer);
                const data = new FormData();
                data.append('files[]', buffer, {
                    filename
                });

                const api = await axios.post('https://uguu.se/upload.php', data, {
                    headers: {
                        ...data.getHeaders(),
                        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                        "Referer": "https://uguu.se/"
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
    },
    
    tempfiles: async function(buffer) {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = await file(buffer);
                const data = new FormData();
                data.append('file', buffer, {
                    filename
                });

                const { data: api } = await axios.post('https://tmpfiles.org/api/v1/upload', data, {
                    headers: {
                        ...data.getHeaders(),
                        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                        "Referer": "https://tmpfiles.org/"
                    }
                });

                const match = /tmpfiles\.org\/([^"]+)/.exec(api.data.url);
                resolve('https://tmpfiles.org/dl/' + match[1]);
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
