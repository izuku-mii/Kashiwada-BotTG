import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'
import { getMimeType } from '../lib/getMime.js'

async function handler(m, { conn, usedPrefix, command, text }) {
  try {
    const base = m.fakeObj?.message || m.message
    const replied = base?.reply_to_message || m.quoted?.fakeObj?.message
    const msg = replied || base

    // Require photo
    const photos = msg?.photo
    if (!Array.isArray(photos) || photos.length === 0) {
      return m.reply(
        `This feature needs a photo + text instruction, nya~ 📷📝\n` +
          `Reply to a photo with: *${usedPrefix + command} <instruction>*\n` +
          `Example: ${usedPrefix + command} add anime cat ears`
      )
    }

    // Require text instructions
    if (!text || !text.trim()) {
      return m.reply(
        `Please add a text instruction to edit the photo~\n` +
          `Example: *${usedPrefix + command} add anime cat ears*`
      )
    }

    const fileId = photos[photos.length - 1]?.file_id
    if (!fileId) return m.reply(`The photo is not valid (｡•́︿•̀｡)\nPlease send it again~`)

    await m.reply(wait)

    // Get file link from Telegram and download
    const fileLink = await conn.telegram.getFileLink(fileId)
    const tgRes = await fetch(fileLink.href)
    const media = Buffer.from(await tgRes.arrayBuffer())

    // Safety check
    const mime = await getMimeType(media)
    if (!/^image\//.test(mime)) {
      return m.reply(`That's not a valid image file~ (≧ヘ≦ )`)
    }

    // Upload to CDN to get a URL
    const srcUrl = await uploadImage(media)

    // Call Ryzumi Gemini Image Edit (PNG)
    const apiUrl = `${APIs.ryzumi}/api/ai/image/gemini?text=${encodeURIComponent(text)}&url=${encodeURIComponent(srcUrl)}`
    const apiRes = await fetch(apiUrl, { method: 'GET', headers: { accept: 'image/png' } })
    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => '')
      throw new Error(`Gemini Edit failed (${apiRes.status}): ${body || 'no body'}`)
    }

    const outBuf = Buffer.from(await apiRes.arrayBuffer())
    await conn.sendFile(
      m.chat,
      outBuf,
      `gemini-edit.png`,
      `Here's your edited image~ ✨ (⁄ ⁄•⁄ω⁄•⁄ ⁄)`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply(`Image edit failed... gomen~ (╥﹏╥)`)
  }
}

handler.help = ['geminiedit']
handler.tags = ['ai']
handler.command = ['geminiedit']

handler.register = true
handler.premium = false
handler.limit = 8

export default handler
