// Don't delete this credit!!!
// Script by ShirokamiRyzen

import fetch from 'node-fetch'

function getDisplayName(m, conn) {
  const from =
    m.from ||
    m.fakeObj?.message?.from ||
    m.message?.from ||
    m.quoted?.fakeObj?.message?.from ||
    null;

  if (from?.username) return `@${from.username}`;
  if (from?.first_name && from?.last_name) return `${from.first_name} ${from.last_name}`;
  if (from?.first_name) return from.first_name;

  try {
    const n = conn?.getName?.(m.sender);
    if (n) return n;
  } catch {}
  return 'nya~';
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `Usage:\n${usedPrefix + command} <instagram post/reel url>\n` +
      `Example: ${usedPrefix + command} https://www.instagram.com/reels/DM6JcftR8E_/`
    );
  }

  try {
    await m.reply(wait);

    const api = `${APIs.ryzumi}/api/downloader/igdl?url=${encodeURIComponent(args[0])}`;
    const res = await fetch(api, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`API request failed (${res.status})`);

    const data = await res.json();
    const list = Array.isArray(data?.data) ? data.data : [];
    if (!list.length) throw new Error('No available media found');

    const media = list.filter(x => typeof x?.url === 'string');
    if (!media.length) throw new Error('No available media found');

    const uname = getDisplayName(m, conn);
    let first = true;

    for (const item of media) {
      const url = item.url;
      const t   = (item.type || '').toLowerCase(); // "image" | "video"
      const caption = first ? `Here's your media, ${uname} ~ ✨` : '';
      first = false;

      if (t === 'video') {
        await conn.sendMessage(
          m.chat,
          {
            video: { url },
            mimetype: 'video/mp4',
            fileName: 'instagram-video.mp4',
            caption
          },
          { quoted: m }
        );
      } else if (t === 'image') {
        await conn.sendMessage(
          m.chat,
          { image: { url }, caption },
          { quoted: m }
        );
      } else {
        // fallback kalau type kosong/aneh → coba image dulu, lalu video
        try {
          await conn.sendMessage(m.chat, { image: { url }, caption }, { quoted: m });
        } catch {
          await conn.sendMessage(
            m.chat,
            { video: { url }, mimetype: 'video/mp4', fileName: 'instagram-video.mp4', caption },
            { quoted: m }
          );
        }
      }
    }

  } catch (err) {
    console.error('IG Download Error:', err);
    await conn.reply(m.chat, `An error occurred: ${err?.message || err}`, m);
  }
};

handler.help = ['instagram'];
handler.tags = ['downloader'];
handler.command = /^(instagram|ig|igdl)$/i;

handler.limit = true
handler.register = true

export default handler
