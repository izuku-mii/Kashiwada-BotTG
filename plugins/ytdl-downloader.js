import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

let izuku = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    if (command === 'ytmp3' || command === 'yta' || command === 'ytaudio') {
        if (!text.includes('youtu')) return m.reply(' ⚠️ Mana Link Nya !')
        return new Promise(async (revolse) => {
            await axios.get(`${apikey.izumi}/downloader/youtube?url=${text}&format=mp3`).then(async (ad) => {
                const { result } = ad.data
                const youtubeInfo = `╭───「 🎬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗜𝗡𝗙𝗢 」───
│  📌 *Title*: ${result.title || 'No title'}
│  🆔 *Video ID*: ${result.videoId || 'N/A'}
│  ⏳ *Uploaded*: ${result.metadata.ago || 'Unknown'}
│  👤 *Channel*: ${result.author.channelTitle || 'Unknown'}
│  🔗 *URL*: ${result.url || 'Not available'}
╰───────────────────────`;

                await conn.sendMessage(
                    m.chat, {
                        image: {
                            url: result.thumbnail
                        },
                        parse_mode: 'Markdown',
                        caption: youtubeInfo
                    }, {
                        quoted: { message_id: m.id }
                    });
                    
                let buff = await axios.get(result.download, {
                    responseType: 'arraybuffer'
                });
                const audioRes = Buffer.from(buff.data, 'binary')

                if (audioRes.length > 100 * 1024 * 1024) {
                    await conn.sendMessage(
                        m.chat, {
                            document: audioRes,
                            fileName: result.title + '.mp3',
                            mimetype: 'audio/mpeg',
                            caption: youtubeInfo
                        }, {
                            quoted: { message_id: m.id }
                        })
                } else {
                    await conn.sendMessage(
                        m.chat, {
                            audio: audioRes,
                            fileName: result.title + '.mp3',
                            mimetype: 'audio/mpeg',
                            caption: ' *[ √ ]* Done Audio Nya :D'
                        }, {
                            quoted: { message_id: m.id }
                        })
                }
            }).catch(async (err) => {
                await m.reply(' *[ ! ]* Maaf Mungkin Lu Kebanyakan Request Kali');
                throw err;
            });
        })
    } else if (command === 'ytmp4' || command === 'ytv' || command === 'ytvideo') {
        if (!text.includes('youtu')) return m.reply(` *[ ! ]* Mana Link Nya !, sama quality nya contoh: ${usedPrefix + command} <link yt> <format>`);
        let [link, kualitas] = text.split(' ');
        let quality = kualitas || '720';
        const video = ['360', '480', '720', '1080'];
        if (!video.includes(quality)) return m.reply(` *[ ! ]* format videonya tersedia: ${format.video.map((a => a)).join(', ')} `);
        return new Promise(async (revolse) => {
            await axios.get(`${apikey.izumi}/downloader/youtube?url=${link}&format=${quality}`).then(async (ad) => {
                const { result } = ad.data
                const youtubeInfo = `╭───「 🎬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗜𝗡𝗙𝗢 」───
│  📌 *Title*: ${result.title || 'No title'}
│  🆔 *Video ID*: ${result.videoId || 'N/A'}
│  ⏳ *Uploaded*: ${result.metadata.ago || 'Unknown'}
│  👤 *Channel*: ${result.author.channelTitle || 'Unknown'}
│  🔗 *URL*: ${result.url || 'Not available'}
╰───────────────────────`;

                await conn.sendMessage(
                    m.chat, {
                        image: {
                            url: result.thumbnail
                        },
                        parse_mode: 'Markdown',
                        caption: youtubeInfo
                    }, {
                        quoted: { message_id: m.id }
                    });
                    
                let buff = await axios.get(result.download, {
                    responseType: 'arraybuffer'
                });

                const con = await fixVideoBuffer(buff.data);
                const videoRes = Buffer.from(con, 'binary')

                if (videoRes.length > 40 * 1024 * 1024) {
                    await conn.sendMessage(
                        m.chat, {
                            document: videoRes,
                            fileName: result.title + '.mp4',
                            mimetype: 'video/mp4',
                            caption: youtubeInfo
                        }, {
                            quoted: { message_id: m.id }
                        })
                } else {
                    await conn.sendMessage(
                        m.chat, {
                            video: videoRes,
                            mimetype: 'video/mp4',
                            fileName: result.title + '.mp4',
                            caption: ' *[ √ ]* Done Video Nya :D'
                        }, {
                            quoted: { message_id: m.id }
                        }
                    );
                }
            }).catch(async (err) => {
                await m.reply(' *[ ! ]* Maaf Mungkin Lu Kebanyakan Request Kali');
                throw err;
            });
        });
    };
};

izuku.command = /^(ytmp3|yta|ytaudio|ytmp4|ytv|ytvideo)$/i;
izuku.help = ['ytmp3', 'yta', 'ytaudio', 'ytmp4', 'ytv', 'ytvideo'];
izuku.tags = ['downloader']

async function fixVideoBuffer(buffer) {
    const tmpDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(tmpDir, {
        recursive: true
    });

    const input = path.join(tmpDir, 'input.mp4');
    const output = path.join(tmpDir, 'output.mp4');

    await fs.writeFile(input, buffer);

    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .outputOptions([
                '-movflags +faststart',
                '-c copy'
            ])
            .on('end', async () => {
                const fixedBuffer = await fs.readFile(output);
                await fs.unlink(input);
                await fs.unlink(output);
                resolve(fixedBuffer);
            })
            .on('error', reject)
            .save(output);
    });
}

export default izuku;
