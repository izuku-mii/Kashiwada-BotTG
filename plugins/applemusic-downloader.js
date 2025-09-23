const izumi = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Masukan Link/Query ')

  try {
    // Jika input berupa link Spotify
    if (/https?:\/\/(music)\.apple\.com/.test(text)) {
      const { result } = await (
        await fetch(global.apikey.izumi + '/downloader/applemusic?url=' + encodeURIComponent(text))
      ).json()

      let caption = `╭───「 *☘️ Downloader AppleMusic* 」───
│ 🎧 Title: ${result.title || ''}
│ 👤 Artist: ${result.artists || ''}
│ 🔗 Url: ${result.url || ''}
╰───────────────────────`

      const reply = await conn.sendMessage(
        m.chat,
        { photo: { url: result.thumbnail }, caption },
        { quoted: m }
      )

      await conn.sendMessage(
        m.chat,
        { audio: { url: result.download }, mimetype: 'audio/mpeg' },
        { quoted: reply }
      )

    } else {
      // Jika input berupa query search Apple Music
      const { result } = await (
        await fetch(global.apikey.izumi + '/search/applemusic?query=' + encodeURIComponent(text))
      ).json()

      let pick = result.slice(0, 5) // ambil maksimal 5 item

      let caption = `╭───「 🔍 *AppleMusic Search* 」───\n│\n`
      caption += pick
        .map(
          (v, i) =>
            `│ 🎵 *${i + 1}. ${v.title}*\n│ 👤 ${v.author}\n│ 🔗 ${v.link}\n│`
        )
        .join("\n")
      caption += `\n╰───────────────\n\n*Balas pesan ini dengan angka 1-5* untuk mendownload`

      // Simpan data sementara
      let sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 5)
      global.appleMusicSession = global.appleMusicSession || {}
      global.appleMusicSession[sessionId] = {
        picks: pick,
        timestamp: Date.now(),
        chatId: m.chat,
        searchMessageId: m.id // simpan ID pesan command asli
      }

      // Kirim pesan biasa (bukan inline keyboard)
      const searchResultMsg = await conn.sendMessage(m.chat, {
        text: caption,
        parseMode: "Markdown",
        disableWebPagePreview: true,
        replyToMessageId: m.id
      })

      // Simpan juga ID pesan hasil search
      global.appleMusicSession[sessionId].resultMessageId = searchResultMsg.message_id

      // Cleanup session setelah 10 menit
      setTimeout(() => {
        if (global.appleMusicSession[sessionId]) {
          delete global.appleMusicSession[sessionId]
        }
      }, 10 * 60 * 1000)
    }
  } catch (e) {
    console.error('Error', e)
    await m.reply('❌ Maaf Error, Mungkin Request Terlalu Banyak')
  }
}

// Handler untuk reply angka
izumi.before = async (m, { conn }) => {
  // Cek jika ini adalah reply ke pesan bot
  if (!m.fakeObj.message?.reply_to_message?.text || !m.text) return false
  
  const repliedMsg = m.fakeObj.message.reply_to_message.text
  const userNumber = m.text.trim()
  
  // Cek jika pesan yang di-reply mengandung "AppleMusic Search"
  if (repliedMsg.includes('AppleMusic Search') && /^[1-5]$/.test(userNumber)) {
    try {
      let index = parseInt(userNumber) - 1
      
      // Cari session yang sesuai berdasarkan ID pesan yang di-reply
      let sessionId = Object.keys(global.appleMusicSession || {}).find(key => {
        let session = global.appleMusicSession[key]
        return session && session.resultMessageId === m.fakeObj.message.reply_to_message.message_id
      }) // <-- kurung tutup sudah diperbaiki

      if (!sessionId) {
        await m.reply('❌ Session expired atau pilihan tidak valid. Silahkan search ulang.')
        return true
      }

      let pick = global.appleMusicSession[sessionId].picks[index]
      
      // Hapus pesan reply user (pesan angka)
      await conn.telegram.deleteMessage(m.chat, m.fakeObj.message.reply_to_message.message_id).catch((e) => {
        console.log('Gagal hapus pesan user:', e)
      })
      
      // Hapus pesan hasil search bot
      await conn.telegram.deleteMessage(m.chat, m.fakeObj.message.reply_to_message.message_id).catch((e) => {
        console.log('Gagal hapus pesan bot:', e)
      })

      // Kirim status processing
      let processingMsg = await conn.sendMessage(m.chat, {
        text: `⏳ Mengunduh pilihan ${userNumber}...`,
        reply_to_message_id: m.id
      })

      const { result } = await (
        await fetch(global.apikey.izumi + '/downloader/applemusic?url=' + encodeURIComponent(pick.link))
      ).json()

      let caption = `╭───「 *☘️ Downloader AppleMusic* 」───
│ 🎧 Title: ${result.title || pick.title}
│ 👤 Artist: ${result.author || pick.author}
│ 🔗 Url: ${result.url || pick.link}
╰───────────────────────`

      // Hapus pesan processing
      await conn.telegram.deleteMessage(m.chat, processingMsg.message_id).catch(() => {})

      // Kirim gambar thumbnail
      const reply = await conn.sendMessage(
        m.chat,
        { 
          image: { url: result.thumbnail || pick.thumbnail }, 
          caption: caption
        },
        { quoted: global.appleMusicSession[sessionId].searchMessageId }
      )

      // Kirim audio
      await conn.sendMessage(
        m.chat,
        { 
          audio: { url: result.download }, 
          mimetype: 'audio/mpeg',
          fileName: `${(result.title || pick.title).replace(/[^a-zA-Z0-9]/g, '_')}.mp3`
        },
        { quoted: reply }
      )

      // Hapus session setelah digunakan
      delete global.appleMusicSession[sessionId]

    } catch (e) {
      console.error('Apple Music Download Error:', e)
      await conn.sendMessage(m.chat, {
        text: '❌ Gagal mengunduh audio. Silahkan coba lagi.',
        reply_to_message_id: m.fakeObj.message.reply_to_message.message_id
      })
    }
    return true
  }

  return false
}

izumi.command = /^(applemusic|apdl)$/i
izumi.help = ['applemusic', 'apdl']
izumi.tags = ['downloader', 'internet']

export default izumi
