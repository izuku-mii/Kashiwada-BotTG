import fetch from 'node-fetch'

// Simple in-memory session for model/enhance selection per user
// Structure: { [sessionId]: { prompt, user, created } }
if (!global.__txt2imgSessions) global.__txt2imgSessions = {}

const MODELS = ['flux', 'turbo', 'kontext']
const DEFAULT_MODEL = 'turbo'
const DEFAULT_WIDTH = 720
const DEFAULT_HEIGHT = 1280
const DEFAULT_ENHANCE = false

async function generateImage({ prompt, model, width, height, enhance, useV2FallbackFirst = false }) {
  const base = APIs.ryzumi
  const buildUrl = (version) => {
    const vPath = version === 'v2' ? '/api/ai/v2/text2img' : '/api/ai/text2img'
    const q = new URLSearchParams({
      prompt,
      model,
      width: String(width),
      height: String(height),
      enhance: String(enhance)
    }).toString()
    return `${base}${vPath}?${q}`
  }
  const primary = useV2FallbackFirst ? buildUrl('v2') : buildUrl('v1')
  const fallback = useV2FallbackFirst ? buildUrl('v1') : buildUrl('v2')

  let lastErr
  for (const url of [primary, fallback]) {
    try {
      const r = await fetch(url, { method: 'GET', headers: { accept: 'image/png' } })
      if (!r.ok) {
        const body = await r.text().catch(() => '')
        throw new Error(`status ${r.status} ${body.slice(0, 200)}`)
      }
      const buf = Buffer.from(await r.arrayBuffer())
      return { buffer: buf, url }
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

function pruneOldSessions(maxAgeMs = 10 * 1000) { // 10 seconds
  const now = Date.now()
  for (const [id, s] of Object.entries(global.__txt2imgSessions)) {
    if (!s || (now - (s.created || 0)) > maxAgeMs) delete global.__txt2imgSessions[id]
  }
}

function newSessionId() {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)).slice(0, 10)
}

async function handler(m, { conn, usedPrefix, command, text }) {
  try {
    const prompt = (text || '').trim()
    pruneOldSessions()

    // (Callback handling moved to handler.before)

    if (!prompt) {
      return m.reply(
        `Please enter a text prompt to generate an image, nya~ 📝🎨\n` +
        `Example: *${usedPrefix + command} an anime girl with glasses, pink short hair, wearing a uniform and blushing*`
      )
    }

    // Create new session & show buttons (short callback_data to satisfy Telegram <=64 bytes)
    const sessionId = newSessionId()
    global.__txt2imgSessions[sessionId] = { prompt, user: m.sender, created: Date.now() }
    const buttons = [
      [
        { text: 'flux', callback_data: `t2i:${sessionId}:f0` },
        { text: 'turbo', callback_data: `t2i:${sessionId}:t0` },
        { text: 'kontext', callback_data: `t2i:${sessionId}:k0` }
      ],
      [
        { text: 'flux+enh', callback_data: `t2i:${sessionId}:f1` },
        { text: 'turbo+enh', callback_data: `t2i:${sessionId}:t1` },
        { text: 'kontext+enh', callback_data: `t2i:${sessionId}:k1` }
      ]
    ]
    await conn.sendButt(
      m.chat,
      `Choose a model & enhance option for the following prompt:\n\n"${prompt}"\n\nRow 1 = enhance OFF, Row 2 = enhance ON\n(timeout 10s)`,
      buttons,
      m
    )
    return
  } catch (e) {
    console.error(e)
    m.reply(`Image generation failed... gomen~ (╥﹏╥)`)
  }
}

// Before hook to catch callback queries (no prefix needed)
handler.before = async function (m) {
  try {
    if (!m.callbackQuery) return
    if (!m.text || !/^t2i:/.test(m.text)) return
    pruneOldSessions()
    const parts = m.text.split(':')
    if (parts.length !== 3) return
    const sessionId = parts[1]
    const modelEnh = parts[2]
    const modelCode = modelEnh.slice(0, -1)
    const enhFlag = modelEnh.slice(-1)
    const session = global.__txt2imgSessions[sessionId]
    if (!session) {
      await m.reply('Session expired (10 seconds). Please resend the command.')
      return false
    }
    delete global.__txt2imgSessions[sessionId]
    const modelMap = { f: 'flux', t: 'turbo', k: 'kontext' }
    const model = modelMap[modelCode] || DEFAULT_MODEL
    const enhance = enhFlag === '1'
    await m.reply(wait)
    try {
      const { buffer, url } = await generateImage({
        prompt: session.prompt,
        model,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        enhance
      })
      await this.sendFile(
        m.chat,
        buffer,
        'text2img.png',
        `Done~ ✨\nModel: ${model}\nEnhance: ${enhance}\nPrompt: ${session.prompt}\nSource: ${url.includes('/v2/') ? 'v2 (fallback)' : 'v1'}`,
        m
      )
    } catch (e) {
      console.error(e)
      await m.reply('Failed to generate image even after trying fallback... (╥﹏╥)')
    }
    return false // stop further processing
  } catch (e) {
    console.error('txt2img before hook error:', e)
  }
}

handler.help = ['txt2img']
handler.tags = ['ai']
handler.command = ['text2image', 'txt2img']

handler.register = true
handler.premium = false
handler.limit = 5

export default handler
