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
  return 'you';
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `Usage:\n${usedPrefix + command} <twitter/x url>\n` +
      `Example: ${usedPrefix + command} https://x.com/Genshin_7/status/1947507224781459655`
    );
  }

  try {
    await m.reply(wait);

    const url = args[0];

    const api1 = `${APIs.ryzumi}/api/downloader/twitter?url=${encodeURIComponent(url)}`;
    let r1 = await fetch(api1, { headers: { accept: 'application/json' } });
    if (!r1.ok) throw new Error(`API request failed (${r1.status})`);
    let j1 = await r1.json();

    // ---- Fallback to v2 (video-only) when media missing
    if (!j1?.status || !Array.isArray(j1?.media) || j1.media.length === 0) {
      const api2 = `${APIs.ryzumi}/api/downloader/v2/twitter?url=${encodeURIComponent(url)}`;
      const r2 = await fetch(api2, { headers: { accept: 'application/json' } });
      const j2 = await r2.json().catch(() => null);
      if (Array.isArray(j2) && j2.length > 0) {
        // Normalize into main shape: video list (objects with width/height/url)
        j1 = { status: true, type: 'video', media: j2 };
      }
    }

    if (!j1?.status || !Array.isArray(j1?.media) || j1.media.length === 0) {
      throw new Error('Failed to fetch media from Twitter');
    }

    const uname = getDisplayName(m, conn);

    if ((j1.type || '').toLowerCase() === 'image') {
      let first = true;
      for (const imgUrl of j1.media) {
        const caption = first ? `Here's the photo, ${uname} ~ ✨` : '';
        first = false;
        await conn.sendMessage(
          m.chat,
          { image: { url: imgUrl }, caption },
          { quoted: m }
        );
      }
      return;
    }

    const media = j1.media;

    let candidate = null;

    if (typeof media[0] === 'string') {
      candidate = media[0];
    } else if (typeof media[0] === 'object') {
      let obj = media.find(x => String(x.quality || '') === '720');

      if (!obj) obj = media.find(x => String(x.width || '') === '720');

      if (!obj) {
        const withWidth = media
          .map(x => ({ ...x, _w: Number.parseInt(x.width || x.quality || '0', 10) || 0 }))
          .sort((a, b) => b._w - a._w);
        obj = withWidth[0] || media[0];
      }

      candidate = obj?.url || null;
    }

    if (!candidate) throw new Error('No downloadable video URL found');

    const caption = `Here's the video, ${uname} ~ ✨`;
    await conn.sendMessage(
      m.chat,
      {
        video: { url: candidate },
        mimetype: 'video/mp4',
        fileName: 'twitter-video.mp4',
        caption
      },
      { quoted: m }
    );

  } catch (e) {
    console.error('Twitter Download Error:', e);
    await conn.reply(m.chat, `An error occurred: ${e?.message || e}`, m);
  }
};

handler.help = ['twitter'];
handler.tags = ['downloader'];
handler.command = /^(x|twt|twitter|twitterdl)$/i;

handler.limit = true
handler.register = true

export default handler
