export default {
  help: ["cekid", "id"],
  command: ["cekid", "id"],
  tags: ["info"],
  async handler(m, { conn }) {
    let userId = m.sender;
    let chatId = m.chat;

    await conn.telegram.sendMessage(chatId, 
      `👤 User ID: <code>${userId}</code>\n💬 Chat ID: <code>${chatId}</code>`, 
      {
        parse_mode: "HTML",
        reply_to_message_id: m.id
      }
    );
  }
};
