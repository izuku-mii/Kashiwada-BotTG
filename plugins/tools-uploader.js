import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { getMimeType } from '../lib/getMime.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // Get message object (prioritize reply if exists)
    const base = m.fakeObj?.message || m.message;
    const replied = base?.reply_to_message || m.quoted?.fakeObj?.message;
    const msg = replied || base;
    if (!msg) throw 'No media found (｡•́︿•̀｡)';

    // Get media candidates
    const photo = (replied?.photo || msg.photo);
    const video = (replied?.video || msg.video);
    const audio = (replied?.audio || msg.audio);
    const doc   = (replied?.document || msg.document);

    // Get file_id (for photos, use the largest size)
    const fileId =
      (Array.isArray(photo) ? photo[photo.length - 1]?.file_id : undefined) ||
      video?.file_id ||
      audio?.file_id ||
      doc?.file_id;

    if (!fileId) throw 'No media found (つ﹏<)･ﾟ｡';

    await m.reply(wait);

    // Get Telegram file link
    const fileLink = await conn.telegram.getFileLink(fileId);

    // Download to buffer
    const res = await fetch(fileLink.href);
    const media = Buffer.from(await res.arrayBuffer());

    // Detect MIME
    const mime = await getMimeType(media);

    // Decide uploader type
    const isImageOrVideo = /^(image\/(png|jpe?g|gif)|video\/mp4)$/.test(mime);

    // Upload to CDN
    const link = await (isImageOrVideo ? uploadImage : uploadFile)(media);

    // Reply with result (cute style)
    m.reply(
`✨ Upload complete~ \(≧▽≦)/  
📎 *Link:* ${link}  
📏 *Size:* ${media.length} Byte(s)  
⏳ *Expires:* ${isImageOrVideo ? 'No expiration date~ (＾▽＾)' : '24 hours only! (＞﹏＜)'}`
    );

  } catch (e) {
    m.reply(`Upload failed... gomen~ (╥﹏╥) \nReason: ${e?.message || e}`);
  }
};

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = /^(upload|tourl)$/i;

handler.register = true

export default handler
