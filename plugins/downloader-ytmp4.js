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
  const cleaned = String(name)
    .replace(/[^\w\s()\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.replace(/\s+/g, '_');
}

function parseQuality(input) {
  const fallback = 720
  if (!input) return fallback
  const m = String(input).match(/\d{2,4}/)
  const q = m ? parseInt(m[0], 10) : NaN
  const allowed = [144, 240, 360, 480, 720, 1080, 1440, 2160]
  return allowed.includes(q) ? q : fallback
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(
      `Usage:\n${usedPrefix + command} <youtube url> [quality]\n` +
      `Example: ${usedPrefix + command} https://youtu.be/Hy9s13hWsoc 720p\n` +
      `Note: default quality is 720p when omitted.`
    );
  }

  try {
    await m.reply(wait);

    const url = args[0]
    const qualityNum = parseQuality(args[1])
    const api = `${APIs.ryzumi}/api/downloader/ytmp4?url=${encodeURIComponent(url)}&quality=${qualityNum}`

    const res = await fetch(api, { headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`API request failed (${res.status})`)

    const json = await res.json()
    const videoDirectUrl = json?.url
    if (!videoDirectUrl) throw new Error('Failed to fetch video URL')

    const title = json?.title || 'YouTube Video'
    const author = json?.author || ''
    const lengthSeconds = Number(json?.lengthSeconds || 0) || undefined
    const thumb = json?.thumbnail || ''
    const qualityStr = json?.quality || `${qualityNum}p`

    const fileName = `${sanitizeTitle(title)}_${qualityStr}.mp4`
    const uname = getDisplayName(m, conn)

    const captionParts = [
      `Here's your video, ${uname} ~ ✨`,
      `Title: ${title}`,
    ]
    if (author) captionParts.push(`Author: ${author}`)
    if (lengthSeconds) captionParts.push(`Duration: ${lengthSeconds}s`)
    if (qualityStr) captionParts.push(`Quality: ${qualityStr}`)
    const caption = captionParts.join('\n')

    // Optional preview
    if (thumb) {
      try {
        await conn.sendMessage(m.chat, { image: { url: thumb }, caption }, { quoted: m })
      } catch {}
    }

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoDirectUrl },
        mimetype: 'video/mp4',
        fileName,
        caption,
      },
      { quoted: m }
    )

  } catch (err) {
    console.error('YTMP4 Download Error:', err)
    await conn.reply(m.chat, `An error occurred: ${err?.message || err}`, m)
  }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp4|ytv|ytvideo)$/i

handler.limit = 4
handler.register = true

export default handler
