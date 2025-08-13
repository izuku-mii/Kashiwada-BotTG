import fetch from 'node-fetch'

const handler = async (m, { text, conn, usedPrefix, command }) => {
  try {
    const promptText = (text || '').trim()
    if (!promptText) {
      return m.reply(
        `Please send a question / message, nya~ (≧ω≦)ゞ\n\n` +
        `Example:\n${usedPrefix + command} Hello, who are you?`
      )
    }

    await m.reply(wait)

    // Build session id using user id + owner id
    const userId = String(m.sender)
    const ownerId = Array.isArray(global.ownerid) ? (global.ownerid[0] || 'owner') : String(global.ownerid || 'owner')
    const sessionId = `nao-users@${userId}-${ownerId}`

    const apiUrl = `${APIs.ryzumi}/api/ai/gpt-oss?text=${encodeURIComponent(promptText)}&session=${encodeURIComponent(sessionId)}`

    const resp = await fetch(apiUrl, { headers: { accept: 'application/json' } })
    if (!resp.ok) throw new Error(`API request failed (${resp.status})`)
    const json = await resp.json()

    const reply = json.result || json.answer || `No response from AI… gomen~ (╥﹏╥)`
    await conn.sendMessage(m.chat, { text: reply }, { quoted: m })
  } catch (error) {
    console.error('GPT-OSS handler error:', error)
    await conn.sendMessage(m.chat, { text: `Oops… something broke, gomen~ (＞﹏＜)\nReason: ${error?.message || error}` }, { quoted: m })
  }
}

handler.help = ['gptoss']
handler.tags = ['ai']
handler.command = /^(gptoss|ossgpt)$/i

handler.limit = 2
handler.premium = false
handler.register = true

export default handler
