const handler = async (m, { conn, text }) => {
  const userId = m.sender;
  await conn.sendMessage(m.chat, { text: userId }, { quoted: { message_id: m.id } })
}

handler.command = /^(id|getid)$/i
handler.help = ['id', 'getid']
handler.tags = ['info']
handler.private = false

export default handler
