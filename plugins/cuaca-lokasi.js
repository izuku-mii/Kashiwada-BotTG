let oota = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Masukan nama kota!\nContoh: .cuaca Lubuk Bintialo')

  try {
    const res = await fetch(apikey.izumi + '/lokasi/cuaca?lokasi=' + encodeURIComponent(text))
    const { result: cuaca } = await res.json()

    const caption = `
🌦️ <b>${cuaca?.namaTempat || 'Tidak Diketahui'}</b>
📍 <i>${cuaca?.lokasi?.kecamatan || '-'}, ${cuaca?.lokasi?.kotkab || '-'}, ${cuaca?.lokasi?.provinsi || '-'}</i>

🕖 <b>${cuaca?.cuaca?.waktu || '-'}</b>
🌤️ <b>${cuaca?.cuaca?.deskripsi || '-'}</b> (<i>${cuaca?.cuaca?.deskripsi_en || '-'}</i>)
🌡️ ${cuaca?.cuaca?.suhu || '-'}, 💧 ${cuaca?.cuaca?.kelembapan || '-'}
💨 ${cuaca?.cuaca?.angin?.kecepatan || '-'} dari ${cuaca?.cuaca?.angin?.dari || '-'}

${cuaca?.peringatan
  ? `⚠️ <b>Peringatan BMKG:</b>\n<i>${cuaca.peringatan.deskripsi}</i>`
  : '✅ <b>Tidak ada peringatan cuaca.</b>'}

<a href="${cuaca?.url?.bmkg || '#'}">🌍 BMKG</a> | <a href="${cuaca?.url?.gmaps || '#'}">📍 Maps</a>
`.trim()

    await conn.telegram.sendMessage(m.chat, caption, { parse_mode: 'HTML' })
  } catch (e) {
    console.error(e)
    m.reply('❌ Maaf Error Mungkin lu kebanyakan.')
  }
}

oota.command = /^cuaca$/i
oota.help = ['cuaca']
oota.tags = ['lokasi']

export default oota
