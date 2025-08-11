import fetch from 'node-fetch'

function toPerc(n) {
  if (n === null || n === undefined) return '-'
  const v = typeof n === 'number' ? n : Number(n)
  if (Number.isNaN(v)) return '-'
  return v <= 1 ? `${Math.round(v * 100)}%` : `${Math.round(v)}%`
}

function fmtNum(n) {
  if (n === null || n === undefined) return '-'
  const v = Number(n)
  return Number.isNaN(v) ? String(n) : v.toLocaleString('en-US')
}

function pickTxt(msg) {
  if (!msg) return ''
  return (
    msg?.text ||
    msg?.caption ||
    msg?.message?.text ||
    msg?.message?.caption ||
    ''
  )
}

async function handler(m, { text, usedPrefix, command, conn }) {
  try {
    // Accept UID from direct text or replied message's text/caption
    const base = m.fakeObj?.message || m.message
    const replied = base?.reply_to_message || m.quoted?.fakeObj?.message
    const raw = (text || pickTxt(replied) || pickTxt(base) || '').toString().trim()

    const uid = raw.replace(/\D+/g, '')
    if (!uid) {
      return m.reply(
        `Enter a Genshin UID by replying to a UID message or typing it directly.\n` +
        `Example: *${usedPrefix + command} 819226311*`
      )
    }

    await m.reply(wait);

    const url = `${APIs.ryzumi}/api/stalk/genshin?userId=${encodeURIComponent(uid)}`
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Request failed (${res.status}) ${body || ''}`)
    }
    const data = await res.json()

    const meta = data.meta || {}
    const abyss = meta.spiralAbyss || {}
    const theater = meta.theater || {}
    const stygian = meta.stygian || {}
    const previews = Array.isArray(meta.charactersPreview) ? meta.charactersPreview : []

    const header = `乂  G E N S H I N  —  S T A L K E R\n`

    const lines = [
      `╭─❒ Profile`,
      `│◦ UID        : ${meta.uid ?? uid}`,
      `│◦ Nickname   : ${meta.nickname || '-'}`,
      `│◦ Signature  : ${meta.signature || '-'}`,
      `│◦ Level      : ${fmtNum(meta.level)}`,
      `│◦ World Lv   : ${fmtNum(meta.worldLevel)}`,
      `│◦ Achievements: ${fmtNum(meta.achievements)}`,
      `│◦ Enka URL   : ${meta.enkaUrl || '-'}`,
      `╰──────`,
      ``,
      `╭─❒ Visibility`,
      `│◦ Show Details    : ${meta.showCharacterDetails ? 'Yes' : 'No'}`,
      `│◦ Show Constell.  : ${meta.showConstellationPreview ? 'Yes' : 'No'}`,
      `╰──────`,
      ``,
      `╭─❒ Spiral Abyss`,
      `│◦ Floor/Chamber : ${fmtNum(abyss.floor)}/${fmtNum(abyss.chamber)}`,
      `│◦ Stars         : ${fmtNum(abyss.stars)}`,
      `╰──────`,
      ``,
      `╭─❒ Imaginarium Theater`,
      `│◦ Act   : ${fmtNum(theater.act)}`,
      `│◦ Stars : ${fmtNum(theater.stars)}`,
      `│◦ Mode  : ${theater.mode ?? '-'}`,
      `╰──────`,
      ``,
      `╭─❒ Stygian`,
      `│◦ Difficulty : ${fmtNum(stygian.difficulty)}`,
      `│◦ Clear Time : ${fmtNum(stygian.clearTime)}s`,
      `╰──────`,
    ]

    if (previews.length) {
      const maxList = Math.min(previews.length, 12)
      lines.push('', `╭─❒ Characters Preview (${previews.length})`)
      for (let i = 0; i < maxList; i++) {
        const c = previews[i] || {}
        lines.push(
          `│${String(i + 1).padStart(2, ' ')}. Lv${fmtNum(c.level)} C${fmtNum(c.constellation ?? 0)} - ${c.element || '-'} — ${c.costumeName || '-'}`
        )
      }
      if (previews.length > maxList) {
        lines.push(`│… and ${previews.length - maxList} more`)
      }
      lines.push('╰──────')
    }

    const good = data.good || {}
    const chars = Array.isArray(good.characters) ? good.characters : []
    const arts = Array.isArray(good.artifacts) ? good.artifacts : []
    const weaps = Array.isArray(good.weapons) ? good.weapons : []

    lines.push(
      '',
      `╭─❒ GOOD Summary`,
      `│◦ Characters : ${fmtNum(chars.length)}`,
      `│◦ Artifacts  : ${fmtNum(arts.length)}`,
      `│◦ Weapons    : ${fmtNum(weaps.length)}`,
      `╰──────`,
      '',
      `🔗 Enka: ${meta.enkaUrl || 'N/A'}`,
      `Done~ (*/ω\\*) ✨`
    )

    const caption = `${header}\n${lines.join('\n')}`

    // Send caption summary
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })

    // Attach full JSON as a document for complete details
    try {
      const jsonBuf = Buffer.from(JSON.stringify(data, null, 2))
      await conn.sendFile(
        m.chat,
        jsonBuf,
        `genshin_${meta.uid ?? uid}.json`,
        `Full details are in the attached JSON file.`,
        m
      )
    } catch { }
  } catch (e) {
    console.error(e)
    m.reply(`Failed to fetch data… gomen~ (╥﹏╥)\nReason: ${e?.message || e}`)
  }
}

handler.help = ['genshinstalk']
handler.tags = ['stalk']
handler.command = /^(gistalk|genshinstalk)$/i

handler.register = true
handler.limit = true

export default handler
