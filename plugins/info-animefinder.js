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
        `Send or reply to a photo to search the anime source~ 📷✨\n` +
          `Example: reply to a photo with *${usedPrefix + command}*`
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

    // Call WhatAnime API (JSON)
    const apiUrl = `${APIs.ryzumi}/api/weebs/whatanime?url=${encodeURIComponent(srcUrl)}`
    const apiRes = await fetch(apiUrl, { method: 'GET', headers: { accept: 'application/json' } })
    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => '')
      throw new Error(`AnimeFinder failed (${apiRes.status}): ${body || 'no body'}`)
    }

    const data = await apiRes.json()

    // Extract fields with fallbacks
    const title = data.judul || data.title || data.result?.judul || data.result?.title || 'Unknown'
    const episode = data.episode ?? data.result?.episode ?? '-'
    let similarity = data.similarity ?? data.result?.similarity

    // Format similarity to percent
    let similarityText = '-'
    if (typeof similarity === 'number') {
      if (similarity <= 1) similarity = similarity * 100
      similarityText = `${Math.round(similarity)}%`
    } else if (typeof similarity === 'string') {
      const num = Number(similarity)
      if (!Number.isNaN(num)) {
        similarityText = num <= 1 ? `${Math.round(num * 100)}%` : `${Math.round(num)}%`
      }
    }

    const videoURL = data.videoURL || data.result?.videoURL || null
    const videoIMG = data.videoIMG || data.result?.videoIMG || null

    const caption = `Anime Finder Result\n` +
      `Title: ${title}\n` +
      `Episode: ${episode}\n` +
      `Similarity: ${similarityText}`

    // Try sending video clip if available
    let sent = false
    if (videoURL) {
      try {
        const vRes = await fetch(videoURL, { headers: { accept: 'video/mp4,*/*' } })
        if (vRes.ok) {
          const vBuf = Buffer.from(await vRes.arrayBuffer())
          await conn.sendFile(m.chat, vBuf, 'whatanime.mp4', caption, m)
          sent = true
        }
      } catch {
        // ignore and fallback
      }
    }

    if (!sent) {
      if (videoIMG) {
        try {
          const iRes = await fetch(videoIMG)
          const iBuf = Buffer.from(await iRes.arrayBuffer())
          const extra = videoURL ? `\n\nVideo: ${videoURL}` : ''
          await conn.sendFile(m.chat, iBuf, 'whatanime.jpg', caption + extra, m)
          sent = true
        } catch {
          // ignore
        }
      }
    }

    if (!sent) {
      const extra = videoURL ? `\nVideo: ${videoURL}` : ''
      await conn.sendMessage(m.chat, { text: caption + extra }, { quoted: m })
    }
  } catch (e) {
    console.error(e)
    m.reply(`Search failed... gomen~ (╥﹏╥)`)
  }
}

handler.help = ['animefinder', 'whatanime']
handler.tags = ['info']
handler.command = ['animefinder', 'whatanime']

handler.register = true
handler.premium = false
handler.limit = true

export default handler
