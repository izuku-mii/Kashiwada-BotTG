import fs from "fs";

let Izumi = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.fakeObj.message.reply_to_message)
    return m.reply(' ⚠️ Reply Code Trus Masukan Pesan\n\nContoh: ' + usedPrefix + command + ' testing.js');

  if (!text) return m.reply(' ⚠️ Nama file mana?\n\nContoh: ' + usedPrefix + command + ' testing.js');
  if (!text.endsWith('.js')) return m.reply(' ⚠️ Nama File Nya Yang Bener Dong Sayang🤭');
  const sent = await conn.telegram.sendMessage(m.chat, '*[ Please wait while it Loading ]*', { reply_to_message_id: m.id });
  const code = m.fakeObj.message.reply_to_message.text;
  if (!code) return m.reply(' ❌ Yang direply harus berupa teks kode!');

  try {
    const filePath = process.cwd() + '/plugins/' + text;
    fs.writeFileSync(filePath, code, "utf-8");
    
    await conn.telegram.editMessageText(m.chat, sent.message_id, undefined, '*[ Plugin Successfully Saved ]*', { reply_to_message_id: m.id });
  } catch (err) {
    await conn.telegram.editMessageText(m.chat, sent.message_id, undefined, '*[ Failed to Save Plugin ]*', { reply_to_message_id: m.id });
  }
};

Izumi.command = /^(sp|saveplugin)$/i;
Izumi.help = ["sp", "saveplugin"];
Izumi.tags = ["owner"];
Izumi.owner = true;

export default Izumi;
