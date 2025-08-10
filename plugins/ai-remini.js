import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'
import { getMimeType } from '../lib/getMime.js'

async function handler(m, { conn, usedPrefix, command }) {
  try {
    const base = m.fakeObj?.message || m.message;
    const replied = base?.reply_to_message || m.quoted?.fakeObj?.message;
    const msg = replied || base;

    // Only photos
    const photos = msg?.photo;
    if (!Array.isArray(photos) || photos.length === 0) {
      return m.reply(`This feature works only for *photos*, nya~ 📷✨\nPlease reply to a photo or send one with caption *${usedPrefix + command}* (≧◡≦)`);
    }

    await m.reply(wait);

    const fileId = photos[photos.length - 1]?.file_id;
    if (!fileId) return m.reply(`Hmm... that photo seems invalid (｡•́︿•̀｡)\nPlease try sending it again~`);

    // Get file link from Telegram
    const fileLink = await conn.telegram.getFileLink(fileId);
    const tgRes = await fetch(fileLink.href);
    const media = Buffer.from(await tgRes.arrayBuffer());

    // Safety check
    const mime = await getMimeType(media);
    if (!/^image\//.test(mime)) {
      return m.reply(`Ehh? That's not a valid *photo*~ (≧ヘ≦ )\nPlease send a real image file, okay?`);
    }

    // Upload to CDN to get a URL
    const srcUrl = await uploadImage(media);

    // Call Ryzumi Remini (returns binary PNG)
    const apiUrl = `${APIs.ryzumi}/api/ai/remini?url=${encodeURIComponent(srcUrl)}`;
    const apiRes = await fetch(apiUrl, { method: 'GET', headers: { accept: 'image/png' } });
    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => '');
      throw new Error(`Remini failed (${apiRes.status}): ${body || 'no body'}`);
    }

    const outBuf = Buffer.from(await apiRes.arrayBuffer());
    await conn.sendFile(m.chat, outBuf, 'remini.png', `Here's your enhanced photo~ ✨ (⁄ ⁄•⁄ω⁄•⁄ ⁄)`, m);

  } catch (e) {
    console.error(e);
    m.reply(`Processing failed... gomen~ (╥﹏╥)`);
  }
}

handler.help = ['remini'];
handler.tags = ['ai'];
handler.command = ['remini'];

handler.register = true
handler.premium = false
handler.limit = true

export default handler
