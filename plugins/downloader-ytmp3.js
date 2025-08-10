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

function sanitizeTitle(name = '') {
  // Keep letters/numbers/space/underscore/dash/parentheses, replace others with space
  const cleaned = String(name)
    .replace(/[^\w\s()\-]+/g, ' ') // remove illegal filename chars except _ - ( )
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
  // Convert spaces to underscores
  return cleaned.replace(/\s+/g, '_');
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `Usage:\n${usedPrefix + command} <youtube url>\n` +
      `Example: ${usedPrefix + command} https://youtu.be/Hy9s13hWsoc`
    );
  }

  try {
    await m.reply(wait);

    const url = args[0];
    const api = `${APIs.ryzumi}/api/downloader/ytmp3?url=${encodeURIComponent(url)}`;
    const res = await fetch(api, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`API request failed (${res.status})`);

    const json = await res.json();
    const audioUrl = json?.url;
    const title = json?.title || 'YouTube Audio';
    const author = json?.author || '';
    const lengthSeconds = Number(json?.lengthSeconds || 0) || undefined;
    const thumb = json?.thumbnail || '';
    const quality = json?.quality || '';

    if (!audioUrl) throw new Error('Failed to fetch audio URL');

    const fileName = `${sanitizeTitle(title)}.mp3`;
    const uname = getDisplayName(m, conn);

    const captionParts = [
      `Here's your audio, ${uname} ~ ✨`,
      `Title: ${title}`,
    ];
    if (author) captionParts.push(`Author: ${author}`);
    if (lengthSeconds) captionParts.push(`Duration: ${lengthSeconds}s`);
    if (quality) captionParts.push(`Quality: ${quality}`);
    const caption = captionParts.join('\n');

    // Try to send thumbnail first (optional)
    if (thumb) {
      try {
        await conn.sendMessage(
          m.chat,
          { image: { url: thumb }, caption },
          { quoted: m }
        );
      } catch {}
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName,
        caption,
        title,
        performer: author || undefined,
        duration: lengthSeconds,
        thumbnail: thumb || undefined,
      },
      { quoted: m }
    );

  } catch (err) {
    console.error('YTMP3 Download Error:', err);
    await conn.reply(m.chat, `An error occurred: ${err?.message || err}`, m);
  }
};

handler.help = ['ytmp3'];
handler.tags = ['downloader'];
handler.command = /^(ytmp3|yta|ytaudio)$/i;

handler.limit = 3
handler.register = true

export default handler
