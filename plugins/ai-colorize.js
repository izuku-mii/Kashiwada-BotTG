import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'
import { getMimeType } from '../lib/getMime.js'

async function handler(m, { conn, usedPrefix, command }) {
  try {
    const base = m.fakeObj?.message || m.message
    const replied = base?.reply_to_message || m.quoted?.fakeObj?.message
    const msg = replied || base

    // Only photos
    const photos = msg?.photo
    if (!Array.isArray(photos) || photos.length === 0) {
      return m.reply(
        `This feature is only for black-and-white photos, nya~ 📷✨\n` +
          `Reply to a photo or send a photo with the caption *${usedPrefix + command}*`
      )
    }

    const fileId = photos[photos.length - 1]?.file_id
    if (!fileId) return m.reply(`The photo is not valid (｡•́︿•̀｡)\nPlease send it again~`)

    // Get file link from Telegram
    const fileLink = await conn.telegram.getFileLink(fileId)
    const tgRes = await fetch(fileLink.href)
    const media = Buffer.from(await tgRes.arrayBuffer())

    // Safety check
    const mime = await getMimeType(media)
    if (!/^image\//.test(mime)) {
      return m.reply(`That's not a valid image file~ (≧ヘ≦ )`)
    }

    await m.reply(wait)

    // Upload to CDN to get a URL
    const srcUrl = await uploadImage(media)

    // Call Ryzumi Colorize (returns binary PNG)
    const apiUrl = `${APIs.ryzumi}/api/ai/colorize?url=${encodeURIComponent(srcUrl)}`
    const apiRes = await fetch(apiUrl, { method: 'GET', headers: { accept: 'image/png' } })
    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => '')
      throw new Error(`Colorize failed (${apiRes.status}): ${body || 'no body'}`)
    }

    const outBuf = Buffer.from(await apiRes.arrayBuffer())
    await conn.sendFile(m.chat, outBuf, 'colorize.png', `Here's your colorized photo~ ✨`, m)
  } catch (e) {
    console.error(e)
    m.reply(`Processing failed... gomen~ (╥﹏╥)`)
  }
}

handler.help = ['colorize']
handler.tags = ['ai']
handler.command = ['colorize']

handler.register = true
handler.premium = false
handler.limit = 5

export default handler
