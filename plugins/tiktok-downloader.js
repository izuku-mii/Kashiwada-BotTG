import axios from 'axios';

let izumi = async (m, {
    conn,
    text
}) => {
    if (!text.includes('tiktok')) return m.reply('⚠️ Masukan Link Tiktok !')
    try {
        const response = await fetch(apikey.izumi + '/downloader/tiktok?url=' + text);
        const {
            result
        } = await response.json();
        let caption = `╭───「 🔗 DOWNLOADER TIKTOK 」───
│  📌 *Title*: ${result.title || 'No title'}
│  👤 *Name*: ${result.author.nickname || 'Unknown'}
│  👤 *Account*: @${result.author.unique_id || 'Unknown'}
│  🗾 *Negara*:  ${result.region || 'Unknown'}
│  ☘️ *Type*: ${result.images ? 'Foto' : 'Video'}
│  🔗 *URL*: ${text || 'Not available'}
╰───────────────────────`;

        await conn.sendMessage(m.chat, {
            image: {
                url: result.author.avatar
            },
            caption
        }, {
            quoted: {
                message_id: m.id
            }
        });

        if (result.images) {
            for (let i = 0; i < result.images.length; i++) {
                await conn.sendMessage(m.chat, {
                    image: {
                        url: result.images[i]
                    },
                    caption: `Slide: ${i + 1}/${result.images.length}`,
                    fileName: 'tiktok-' + Date.now() + '.png'
                }, {
                    quoted: {
                        message_id: m.id
                    }
                });
            };
        } else {
            await conn.sendMessage(m.chat, {
                video: {
                    url: result.hdplay
                },
                mimetype: 'video/mp4',
                fileName: 'tiktok-' + Date.now() + '.mp4',
                caption
            }, {
                quoted: {
                    message_id: m.id
                }
            });
        };

        await conn.sendMessage(m.chat, {
            audio: {
                url: result.music_info.play
            },
            mimetype: 'video/mp4',
            fileName: 'tiktok-' + Date.now() + '.mp3'
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

izumi.command = /^(tiktok|tt|ttdl)$/i;
izumi.help = ["tiktok", "tt", "ttdl"];
izumi.tags = ["downloader"];

export default izumi;
