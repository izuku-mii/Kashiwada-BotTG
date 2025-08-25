import fs from "fs";
const pluginDir = "./plugins";

function chunkText(text, size = 4000) {
  let chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

let Izumi = async (m, { conn }) => {
  try {
    const files = fs.readdirSync(pluginDir).filter(f => f.endsWith(".js"));

    if (!files.length) return m.reply("📂 Tidak ada plugin .js di folder plugins.");

    const list = "📂 Daftar Plugin (.js):\n\n" + files.map(f => "🔹 " + f).join("\n");

    // potong biar gak melebihi limit telegram
    const chunks = chunkText(list, 4000);
    for (const chunk of chunks) {
      await conn.telegram.sendMessage(m.chat, `<pre>${chunk}</pre>`, { parse_mode: "HTML", reply_to_message_id: m.id });
    }
  } catch (err) {
    m.reply("❌ Gagal membaca folder plugin: " + err.message);
  }
};

Izumi.command = /^(lp|listplugin)$/i;
Izumi.help = ["lp", "listplugin"];
Izumi.tags = ["owner"];
Izumi.owner = true;

export default Izumi;
