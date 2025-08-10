import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'
import { getMimeType } from '../lib/getMime.js'

async function handler(m, { conn, usedPrefix, command, text }) {
  try {
    const base = m.fakeObj?.message || m.message
    const replied = base?.reply_to_message || m.quoted?.fakeObj?.message
    const msg = replied || base

    // Only photos
    const photos = msg?.photo
    if (!Array.isArray(photos) || photos.length === 0) {
      return m.reply(
        `Fitur ini hanya untuk foto, nya~ 📷✨\n` +
          `Balas sebuah foto atau kirim foto dengan caption *${usedPrefix + command}*\n` +
          `Contoh: ${usedPrefix + command}`
      )
    }

    await m.reply(wait);

    const fileId = photos[photos.length - 1]?.file_id
    if (!fileId) return m.reply(`Hmm... fotonya tidak valid (｡•́︿•̀｡)\nCoba kirim ulang ya~`)

    // Get file link from Telegram
    const fileLink = await conn.telegram.getFileLink(fileId)
    const tgRes = await fetch(fileLink.href)
    const media = Buffer.from(await tgRes.arrayBuffer())

    // Safety check
    const mime = await getMimeType(media)
    if (!/^image\//.test(mime)) {
      return m.reply(`Ehh? Itu bukan *foto* yang valid~ (≧ヘ≦ )\nKirim file gambar ya.`)
    }

    // Upload to CDN to get a URL
    const srcUrl = await uploadImage(media)

    // Determine style (default: anime)
    let style = (text || '').trim().toLowerCase()
    if (!style) style = 'anime'

    // Call Ryzumi ToAnime (returns binary PNG)
    const apiUrl = `${APIs.ryzumi}/api/ai/toanime?url=${encodeURIComponent(srcUrl)}&style=${encodeURIComponent(style)}`
    const apiRes = await fetch(apiUrl, { method: 'GET', headers: { accept: 'image/png' } })
    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => '')
      throw new Error(`ToAnime failed (${apiRes.status}): ${body || 'no body'}`)
    }

    const outBuf = Buffer.from(await apiRes.arrayBuffer())
    await conn.sendFile(
      m.chat,
      outBuf,
      `toanime-${style || 'anime'}.png`,
      `Here's your ${style || 'anime'} style photo~ ✨ (⁄ ⁄•⁄ω⁄•⁄ ⁄)`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply(`Processing failed... gomen~ (╥﹏╥)`)()
  }
}

handler.help = ['toanime']
handler.tags = ['ai']
handler.command = ['toanime', 'jadianime']

handler.register = true
handler.premium = false
handler.limit = 5

export default handler