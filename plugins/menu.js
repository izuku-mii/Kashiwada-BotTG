import fs from "fs"
import path from "path"
import { fileURLToPath, pathToFileURL } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let loadedCategories = {}
let totalLoadedCommands = 0

// Loader plugins
const loadBotPlugins = async () => {
  const pluginDir = path.join(__dirname)
  const plugins = []
  const categories = {}
  let totalCommands = 0

  const files = fs.readdirSync(pluginDir)
  for (const file of files) {
    if (file.endsWith(".js") && file !== "menu.js") {
      try {
        const full = path.join(pluginDir, file)
        const mod = await import(pathToFileURL(full).href + `?v=${Date.now()}`)
        const plugin = mod.default || mod
        if (plugin.help && plugin.tags) plugins.push(plugin)
      } catch (e) {
        console.error(`Error loading ${file}:`, e)
      }
    }
  }

  // Susun kategori & command
  plugins.forEach((plugin) => {
    plugin.tags.forEach((tag) => {
      if (!categories[tag]) categories[tag] = []
      plugin.help.forEach((cmd) => {
        if (!categories[tag].includes(cmd)) {
          categories[tag].push(cmd)
          totalCommands++
        }
      })
    })
  })

  loadedCategories = categories
  totalLoadedCommands = totalCommands
}

await loadBotPlugins()

// default caption
const caption = `Hi %name, I am %botname and I was created by %ownername. Even though I'm a bit of a beginner, don't criticize me. I also make anime content or something like that if the owner is bored.`

const caption2 = `\`\`\`INFO
 *∆* Name: %name
 *∆* Limit: %limit
 *∆* Uptime: %uptime
 *∆* Time: %time
 *∆* Date: %date
\`\`\``

const caption3 = `bot %botname, created by ©%ownername`

const handler = async (m, { conn, args = [], usedPrefix, command }) => {
 try {
  const d = new Date()
  const locale = "id-ID"
  const date = d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
  const time = d.toLocaleTimeString(locale, { hour: "numeric", minute: "numeric" })
  const uptime = clockString(process.uptime() * 1000)
  const limit = global.db?.data?.users?.[m.sender]?.limit || 0

  if (!args[0]) {
    let text = caption
      .replace(/%name/g, m.name)
      .replace(/%botname/g, global.botname)
      .replace(/%ownername/g, global.ownername)

    text += "\n\n" + caption2
      .replace(/%name/g, m.name)
      .replace(/%uptime/g, uptime)
      .replace(/%time/g, time)
      .replace(/%date/g, date)
      .replace(/%limit/g, limit)

    text += `\nIf you want to go to the all/list menu: *${usedPrefix + command} all*, *${usedPrefix + command} list*\n`
    text += "\n" + caption3
      .replace(/%botname/g, global.botname)
      .replace(/%ownername/g, global.ownername)
        
    await conn.telegram.sendPhoto(m.chat, global.thumbnail, { caption: Styles(text), parse_mode: 'Markdown', reply_markup: { inline_keyboard: [ [{ text: 'AllMenu', callback_data: `/menu all` }, { text: 'Website', url: global.apikey.izumi }, { text: 'Script Bot Tele', callback_data: `/script` } ] ] }, reply_to_message_id: m.id } );
    return
  }

  if (args[0] === "list") {
    const categoriesList = Object.keys(loadedCategories).map(cat => {
      return `- *${cat}* (${loadedCategories[cat].length} cmds)`
    }).join("\n")
    
    let text = caption
      .replace(/%name/g, m.name)
      .replace(/%botname/g, global.botname)
      .replace(/%ownername/g, global.ownername)

    text += `☘️ *Available Categories:*\n\n${categoriesList}\n\n📌 Total Commands: ${totalLoadedCommands}`
    text += "\n" + caption3
      .replace(/%botname/g, global.botname)
      .replace(/%ownername/g, global.ownername)

    await conn.sendMessage(m.chat, { image: { url: global.thumbnail }, caption: text }, { quoted: { message_id: m.id } });
    return
  }

if (args[0] === "all") {
  // fungsi escape untuk MarkdownV2
  const escapeMarkdown = (text) =>
    text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1")

  const allCmds = Object.keys(loadedCategories).map(cat => {
    return `📂 *${escapeMarkdown(cat)}*\n${loadedCategories[cat].map(c => `- ${escapeMarkdown(c)}`).join("\n")}`
  }).join("\n\n")
  
  let text = `☘️ *Commands \\(${totalLoadedCommands}\\)*\n\n${allCmds}`

  // kalau panjang > 4096, split biar aman
  const chunks = text.match(/[\s\S]{1,3500}/g) || []
  for (let i = 0; i < chunks.length; i++) {
    await conn.sendMessage(
      m.chat,
      { 
        image: { url: global.thumbnail },
        caption: chunks[i],
        parse_mode: "MarkdownV2" 
      },
      { quoted: { message_id: m.id } }
    )
  }
  return
}

  const category = args[0].toLowerCase()
  if (loadedCategories[category]) {
    const cmds = loadedCategories[category].map(cmd => `- ${cmd}`).join("\n")

    let text = caption
      .replace(/%name/g, m.name)
      .replace(/%botname/g, global.botname)
      .replace(/%ownername/g, global.ownername)

    text += "\n\n" + caption2
      .replace(/%name/g, m.name)
      .replace(/%uptime/g, uptime)
      .replace(/%time/g, time)
      .replace(/%date/g, date)
      .replace(/%limit/g, limit)

    text += `☘️ *Category:* ${category}\n\n${cmds}`
    text += "\n" + caption3
      .replace(/%botname/g, global.botname)
      .replace(/%ownername/g, global.ownername)
      
    await conn.sendMessage(m.chat, { image: { url: global.thumbnail }, caption: text }, { quoted: { message_id: m.id } });
    return
  }

  await conn.sendMessage(m.chat, { text: "⚠️ Kategori tidak ditemukan!" }, { quoted: m })
  } catch (e) {
    m.reply(' ❌Error')
    console.error(e)
  }
}

handler.help = ["start", "menu"]
handler.tags = ["main"]
handler.command = /^(start|menu)$/i

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(":")
}

function Styles(text, style = 1) {
    var xStr = "abcdefghijklmnopqrstuvwxyz1234567890".split("");
    var yStr = Object.freeze({
      1: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890",
    });
    var replacer = [];
    xStr.map((v, i) =>
      replacer.push({
        original: v,
        convert: yStr[style].split("")[i],
      }),
    );
    var str = text.toLowerCase().split("");
    var output = [];
    str.map((v) => {
      const find = replacer.find((x) => x.original == v);
      find ? output.push(find.convert) : output.push(v);
    });
    return output.join("");
}

export default handler
