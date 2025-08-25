import fs from "fs";
const pluginDir = "./plugins";

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let Izumi = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(' ⚠️ Get File Mana Contoh: ' + usedPrefix + command + ' twitter-downloader.js')
  if (!text.includes('.js')) return m.reply(' ⚠️ Get Nya Yang Bener Sayang🤭')
  const filePath = pluginDir + '/' + text;

  if (!fs.existsSync(filePath)) {
    return m.reply("❌ File plugin tidak ditemukan.");
  }

  try {
    let content = fs.readFileSync(filePath, "utf-8");;
    if (content.length <= 4000) {
      await conn.telegram.sendMessage(
        m.chat,
        '<pre>' + escapeHTML(content) + '</pre>',
        { parse_mode: "HTML", reply_to_message_id: m.id }
      );
    } else {
      const getfile = fs.readFileSync(filePath);
      await conn.telegram.sendDocument(
        m.chat,
        { source: getfile, filename: text },
        { reply_to_message_id: m.id }
      );
    }
  } catch (err) {
    m.reply('❌ Gagal membaca plugin: ' + err.message);
  }
}

Izumi.command = /^(gp|getplugin)$/i;
Izumi.help = ["gp", "getplugin"];
Izumi.tags = ["owner"];
Izumi.owner = true;

export default Izumi;
