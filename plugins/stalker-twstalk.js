import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `Usage:\n${usedPrefix + command} <username>\n` +
      `Example: ${usedPrefix + command} shirokami_ryzen\n` +
      `Please input a username, nya~ (≧ω≦)ゞ`
    );
  }

  try {
    const url = `${APIs.ryzumi}/api/stalk/twitter?username=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);

    const data = await res.json();

    if (data?.user) {
      const u = data.user;

      let caption = `乂  X  S T A L K E R  —  P R O F I L E\n\n`;
      caption += `╭─❒ User Info\n`;
      caption += `│◦ Username : ${u.screen_name}\n`;
      caption += `│◦ Full Name : ${u.name}\n`;
      caption += `│◦ ID : ${u.id}\n`;
      caption += `│◦ Bio : ${u.description || '-'}\n`;
      caption += `│◦ Location : ${u.location || '-'}\n`;
      caption += `│◦ Website : ${u.website?.display_url || '-'}\n`;
      caption += `│◦ Joined At : ${u.joined_at}\n`;
      caption += `╰──────\n\n`;
      caption += `╭─❒ Statistics\n`;
      caption += `│◦ Followers : ${u.followers}\n`;
      caption += `│◦ Following : ${u.following}\n`;
      caption += `│◦ Total Posts : ${u.statuses_count ?? 0}\n`;
      caption += `│◦ Likes : ${u.likes}\n`;
      caption += `╰──────\n\n`;
      caption += `🔗 Profile: ${u.url}\n\n`;
      caption += `(/ω＼) Here you go~ nya! ✨`;

      await conn.sendMessage(
        m.chat,
        {
          image: { url: u.avatar_url },
          caption, // no markdown escape, no parse mode
        },
        { quoted: m }
      );
    } else {
      throw new Error('User not found or API returned empty data');
    }
  } catch (e) {
    console.error(e);
    m.reply(`Couldn’t find that username… gomen~ (╥﹏╥)\nReason: ${e?.message || e}`);
  }
};

handler.help = ['twitterstalk <username>'];
handler.tags = ['stalk'];
handler.command = /^(twitterstalk|twstalk|xstalk)$/i;

handler.register = true
handler.limit = true

export default handler
