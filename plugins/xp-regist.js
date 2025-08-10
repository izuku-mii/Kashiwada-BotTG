import crypto from 'crypto'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]

  if (user.registered) {
    return m.reply(`You are already registered! (≧▽≦)\nWant to re-register? Use: ${usedPrefix}unreg <SERIAL NUMBER>`)
  }

  if (!text) {
    return m.reply(
      `Wrong format! (｡•́︿•̀｡)\n\nUsage:\n${usedPrefix + command} <name>.<age>\n\nExample: ${usedPrefix + command} Fenrys.20`
    )
  }

  const [name, age] = text.split(".")
  if (!name) return m.reply(`Name cannot be empty! (╥﹏╥)`)
  if (!age) return m.reply(`Age cannot be empty! (╯︵╰,)`)

  const ageNum = parseInt(age, 10)
  if (Number.isNaN(ageNum)) return m.reply(`Age must be a number! (°ロ°)`)
  if (ageNum < 5) return m.reply(`Minimum age is 5 years old! (｀・ω・´)`)
  if (ageNum > 120) return m.reply(`Maximum age is 120 years old! (⊙_☉)`)

  user.name = name.trim()
  user.age = ageNum
  user.registered = true
  user.regTime = Date.now()

  const sn = crypto.createHash("md5").update(m.sender.toString()).digest("hex")

  const caption = [
    '┌─〔 🌸 USER INFO 🌸 〕',
    `├ Name: ${name}`,
    `├ Age: ${ageNum} years old`,
    `├ SN: ${sn}`,
    '└────',
    '',
    'Yay~! You are now successfully registered! (ﾉ´ヮ`)ﾉ*: ･ﾟ',
    'Type */menu* to see all available commands ✧(＾▽＾)'
  ].join('\n')
y
  try {
    await conn.reply(m.chat, caption, m)
  } catch {
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
  }
}

handler.help = ["register"]
handler.tags = ["main"]
handler.command = /^(daftar|register)$/i

export default handler
