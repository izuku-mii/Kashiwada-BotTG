import fetch from 'node-fetch'

async function handler(m, { conn, usedPrefix, command, text }) {
  try {
    const prompt = (text || '').trim()
    if (!prompt) {
      return m.reply(
        `Please enter a text prompt to create an image, nya~ 📝🎨\n` +
          `Example: *${usedPrefix + command} a girl with glasses, pink short hair, anime style*`
      )
    }

    await m.reply(wait)

    // Call Flux Schnell (PNG output)
    const apiUrl = `${APIs.ryzumi}/api/ai/flux-schnell?prompt=${encodeURIComponent(prompt)}`
    const resp = await fetch(apiUrl, { method: 'GET', headers: { accept: 'image/png' } })
    if (!resp.ok) {
      const body = await resp.text().catch(() => '')
      throw new Error(`Flux generation failed (${resp.status}): ${body || 'no body'}`)
    }

    const img = Buffer.from(await resp.arrayBuffer())
    await conn.sendFile(
      m.chat,
      img,
      'flux.png',
      `Done~ ✨\nPrompt: ${prompt}`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply(`Image generation failed... gomen~ (╥﹏╥)`)
  }
}

handler.help = ['flux']
handler.tags = ['ai']
handler.command = ['flux']

handler.register = true
handler.premium = false
handler.limit = 5

export default handler
