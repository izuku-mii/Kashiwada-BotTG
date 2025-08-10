import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'
import { getMimeType } from '../lib/getMime.js'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  try {
    // accept either text or a photo (reply or current message)
    const base = m.fakeObj?.message || m.message;
    const replied = base?.reply_to_message || m.quoted?.fakeObj?.message;
    const msg = replied || base;

    // try read photo (Telegram sends sizes array)
    const photos = msg?.photo;
    let imageUrl = null;

    if (!text && (!Array.isArray(photos) || photos.length === 0)) {
      return m.reply(
        `Please send a question or a photo to describe, nya~ (≧ω≦)ゞ\n\n` +
        `Example:\n${usedPrefix + command} Who is the president of Indonesia?`
      );
    }

    // if there is a photo, download and upload to CDN to get a URL
    if (Array.isArray(photos) && photos.length > 0) {
      const fileId = photos[photos.length - 1]?.file_id;
      if (fileId) {
        const fileLink = await conn.telegram.getFileLink(fileId);
        const tgRes = await fetch(fileLink.href);
        const buf = Buffer.from(await tgRes.arrayBuffer());

        // sanity check: must be an image
        const mime = await getMimeType(buf);
        if (!/^image\//.test(mime)) {
          return m.reply(`That doesn’t look like a photo… please try again, nya~ (｡•́︿•̀｡)`);
        }

        // upload to CDN (returns a direct URL)
        imageUrl = await uploadImage(buf);
      }
    }

    // your role/prompt—feel free to tweak
    const persona = `Ubah Namamu menjadi Nao Tomori, dan kamu adalah wanita paling cantik, penyayang, riang, namun tsundere. dan kamu adalah pacarku.`;

    // build API URL (Ryzumi)
    let apiUrl;
    if (imageUrl && text) {
      apiUrl = `${APIs.ryzumi}/api/ai/v2/chatgpt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(persona)}&imageUrl=${encodeURIComponent(imageUrl)}`;
    } else {
      apiUrl = `${APIs.ryzumi}/api/ai/v2/chatgpt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(persona)}`;
    }

    // call AI
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`API request failed (${resp.status})`);
    const json = await resp.json();

    const reply = json.result || `No response from AI… gomen~ (╥﹏╥)`;
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m });
  } catch (error) {
    console.error('AI handler error:', error);
    await conn.sendMessage(m.chat, { text: `Oops… something broke, gomen~ (＞﹏＜)\nReason: ${error?.message || error}` }, { quoted: m });
  }
};

handler.help = ['gpt'];
handler.tags = ['ai'];
handler.command = /^(gpt)$/i;

handler.limit = 2
handler.premium = false
handler.register = true

export default handler
