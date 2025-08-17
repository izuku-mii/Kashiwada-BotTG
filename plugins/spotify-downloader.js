let izumi = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Masukan Link/Query ')
  try {
    if (/https?:\/\/(open|play)\.spotify\.com/.test(text)) {
      const { result } = await (await fetch(global.apikey.izumi + '/downloader/spotify?url=' + encodeURIComponent(text))).json()

      let caption = `╭───「 *☘️ Downloader Spotify* 」───
│  *🎧 Title*: ${result.title || ''}
│  *👤 Artist*: ${result.artists || ''}
│  *🔗 Url*: ${result.external_url || ''}
╰───────────────────────`

      const reply = await conn.sendMessage(m.chat, { image: { url: result.image }, caption }, { quoted: m })

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: result.download },
          mimetype: 'audio/mpeg',
          caption: ''
        },
        { quoted: reply }
      )

    } else {
      const { result } = await (await fetch(global.apikey.izumi + '/search/spotify?q=' + encodeURIComponent(text))).json()
      let pick = result.sort(() => 0.5 - Math.random()).slice(0, 5)
      
      let caption = `╭───「 🔍 *Spotify Search* 」───\n│\n`
      caption += pick
        .map(
          (v, i) =>
            `│ 🎵 *${i + 1}. ${v.title}*\n│ 👤 ${v.artist}\n│ ⏱️ ${v.duration}\n│ 🔗 [Open](${v.url})\n│`
        )
        .join("\n")
      caption += `\n╰───────────────`

      await conn.telegram.sendMessage(m.chat, caption, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: pick.map((v, i) => [
            {
              text: `🎶 ${i + 1}. ${v.title}`,
              callback_data: `spotify:${v.url}`
            }
          ])
        },
        reply_to_message_id: m.id
      })
    }
  } catch (e) {
    await m.reply(' ❌ Maaf Error Mungkin Lu Kebanyakan Request')
    console.error('Error', e)
  }
}

izumi.before = async (m, { conn }) => {
  if (!m.callbackQuery) return !1
  let data = m.callbackQuery.data || ''

  if (data.startsWith('spotify:')) {
    try {
      let url = data.replace('spotify:', '').trim()

      const { result } = await (await fetch(global.apikey.izumi + '/downloader/spotify?url=' + encodeURIComponent(url))).json()

      let caption = `╭───「 *☘️ Downloader Spotify* 」───
│  *🎧 Title*: ${result.title || ''}
│  *👤 Artist*: ${result.artists || ''}
│  *🔗 Url*: ${result.external_url || ''}
╰───────────────────────`

      await conn.telegram.deleteMessage(m.chat, m.callbackQuery.message.message_id).catch(() => {})

      const reply = await conn.sendMessage(
        m.chat,
        { image: { url: result.image }, caption },
        { quoted: m }
      )

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: result.download },
          mimetype: 'audio/mpeg',
          caption: ''
        },
        { quoted: reply }
      )
    } catch (e) {
      console.error(e)
      await conn.telegram.answerCallbackQuery(m.callbackQuery.id, {
        text: '❌ Gagal ambil data',
        show_alert: true
      })
    }
    return !0
  }
    
  return !1
}

izumi.command = /^(spotify|spdl)$/i
izumi.help = ['spotify', 'spdl']
izumi.tags = ['downloader', 'internet']

export default izumi
