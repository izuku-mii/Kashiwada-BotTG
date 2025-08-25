import fs from "fs";

let Izumi = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(' ⚠️ Nama file mana?\n\nContoh: ' + usedPrefix + command + ' testing.js');
  if (!text.endsWith('.js')) return m.reply(' ⚠️ Nama File Nya Yang Bener Dong Sayang🤭');
  const sent = await conn.telegram.sendMessage(m.chat, '*[ Please wait while it Loading ]*', { reply_to_message_id: m.id });

  try {
    const filePath = process.cwd() + '/plugins/' + text;
    fs.unlinkSync(filePath);
    
    await conn.telegram.editMessageText(m.chat, sent.message_id, undefined, '*[ Plugin Successfully Delete ]*', { reply_to_message_id: m.id });
  } catch (err) {
    await conn.telegram.editMessageText(m.chat, sent.message_id, undefined, '*[ File Not Found ]*', { reply_to_message_id: m.id });
  }
};

Izumi.command = /^(dp|deleteplugin)$/i;
Izumi.help = ["dp", "deleteplugin"];
Izumi.tags = ["owner"];
Izumi.owner = true;

export default Izumi;
