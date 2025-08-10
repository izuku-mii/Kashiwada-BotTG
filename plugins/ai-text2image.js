import fetch from 'node-fetch'

async function handler(m, { conn, usedPrefix, command, text }) {
  try {
    const prompt = (text || '').trim()
    if (!prompt) {
      return m.reply(
        `Please enter a text prompt to create an image, nya~ 📝🎨\n` +
          `Example: *${usedPrefix + command} an anime girl with glasses, pink short hair, wearing a uniform and blushing*`
      )
    }

    await m.reply(wait)

    // Call Text2Img v2 (PNG output)
    const apiUrl = `${APIs.ryzumi}/api/ai/v2/text2img?prompt=${encodeURIComponent(prompt)}`
    const resp = await fetch(apiUrl, { method: 'GET', headers: { accept: 'image/png' } })
    if (!resp.ok) {
      const body = await resp.text().catch(() => '')
      throw new Error(`Text2Image failed (${resp.status}): ${body || 'no body'}`)
    }

    const img = Buffer.from(await resp.arrayBuffer())
    await conn.sendFile(
      m.chat,
      img,
      'text2img.png',
      `Done~ ✨\nPrompt: ${prompt}`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply(`Image generation failed... gomen~ (╥﹏╥)`)
  }
}

handler.help = ['txt2img']
handler.tags = ['ai']
handler.command = ['text2image', 'txt2img']

handler.register = true
handler.premium = false
handler.limit = 10

export default handler
