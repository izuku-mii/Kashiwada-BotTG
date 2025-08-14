
import util from 'util'
import fs from 'fs/promises'
import path from 'path'
import { pathToFileURL } from 'url'
import crypto from 'crypto'

function escapeMarkdown(text) {
  return text.toString()
    .replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

function safeCodeBlock(content) {
  if (!content) return ''
  const escaped = content.toString().replace(/```/g, '`‌`‌`')
  return '```\n' + escaped + '\n```'
}

const tmpDir = './.eval-tmp'

export default async function handler(m, _2) {
  const { conn, noPrefix } = _2
  let _return = null
  let _syntax = ''
  const _text = noPrefix.trim()
  const old = m.exp * 1

  const filename = `.eval-${crypto.randomUUID()}.mjs`
  const filepath = path.resolve(tmpDir, filename)

  // 🔍 Pisahkan import dan body
  const importLines = []
  const bodyLines = []

  for (const line of _text.split('\n')) {
    if (/^\s*import\s.+from\s.+/.test(line)) importLines.push(line)
    else bodyLines.push(line)
  }

  const moduleContent = `
${importLines.join('\n')}
import util from 'util'

export default async ({ m, conn, argument }) => {
${bodyLines.join('\n')}
}
`.trim()

  try {
    await fs.mkdir(tmpDir, { recursive: true })
    await fs.writeFile(filepath, moduleContent)

    const imported = await import(pathToFileURL(filepath).href + `?t=${Date.now()}`)
    _return = await imported.default({ m, conn, argument: [conn, _2] })
  } catch (e) {
    _return = e
  } finally {
    await fs.unlink(filepath).catch(() => {})
    const finalOutput = _syntax + escapeMarkdown(util.format(_return))
    if (finalOutput.length > 4096) {
      await m.reply('Output terlalu panjang, dipotong...', m)
      await m.reply(finalOutput.substring(0, 4000) + '...', m)
    } else {
      await m.reply(finalOutput, m)
    }
    m.exp = old
  }
}

handler.help = ['> ', '=> ']
handler.tags = ['advanced']
handler.customPrefix = /^=?> /
handler.command = /(?:)/i
