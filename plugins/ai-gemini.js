import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'
import { getMimeType } from '../lib/getMime.js'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  try {
    // Get the main or replied message
    const base = m.fakeObj?.message || m.message
    const replied = base?.reply_to_message || m.quoted?.fakeObj?.message
    const msg = replied || base

    // Check for photo
    const photos = msg?.photo
    let imageUrl = null

    if (!text) {
      return m.reply(
        `Send a question~ (⁄˘⁄ ⁄ ω ⁄ ⁄˘⁄)♡\n\n` +
          `Example:\n${usedPrefix + command} Who is the president of Indonesia?`
      )
    }

    // If photo exists, download and upload to CDN
    if (Array.isArray(photos) && photos.length > 0) {
      const fileId = photos[photos.length - 1]?.file_id
      if (fileId) {
        const fileLink = await conn.telegram.getFileLink(fileId)
        const tgRes = await fetch(fileLink.href)
        const buf = Buffer.from(await tgRes.arrayBuffer())

        // Validate image
        const mime = await getMimeType(buf)
        if (!/^image\//.test(mime)) {
          return m.reply(`That's not an image, try again~ (；´∀｀)`)
        }

        imageUrl = await uploadImage(buf)
      }
    }

    // Build API URL
    let apiUrl
    if (imageUrl && text) {
      apiUrl = `${APIs.ryzumi}/api/ai/gemini?text=${encodeURIComponent(text)}&url=${encodeURIComponent(imageUrl)}`
    } else {
      apiUrl = `${APIs.ryzumi}/api/ai/gemini?text=${encodeURIComponent(text)}`
    }

    // Call AI
    const resp = await fetch(apiUrl)
    if (!resp.ok) throw new Error(`API request failed (${resp.status})`)
    const json = await resp.json()

    const reply = json.answer || json.result || `No response… ( •︠ˍ•︡ )`
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
  } catch (error) {
    console.error('AI Gemini error:', error)
    await conn.sendMessage(
      m.chat,
      { text: `Oops, something went wrong (＞﹏＜)\nReason: ${error?.message || error}` },
      { quoted: m }
    )
  }
}

handler.help = ['gemini']
handler.tags = ['ai']
handler.command = /^(gemini)$/i

handler.limit = 3
handler.premium = false
handler.register = true

export default handler
