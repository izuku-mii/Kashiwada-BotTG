import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `Usage:\n${usedPrefix + command} <username>\n` +
      `Example: ${usedPrefix + command} fatih_frdaus\n` +
      `Please provide an Instagram username, nya~ (≧ω≦)ゞ`
    );
  }

  try {
    await m.reply(wait);
    const url = `${APIs.ryzumi}/api/stalk/instagram?username=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();

    // Expected shape:
    // { avatar, name, username, posts, followers, following, bio }
    if (!data?.username && !data?.avatar) {
      throw new Error('Empty response from API');
    }

    const avatar     = data.avatar || '';
    const username   = data.username || text;
    const fullName   = data.name || '-';
    const bio        = data.bio || '-';
    const posts      = data.posts ?? '-';
    const followers  = data.followers ?? '-';
    const following  = data.following ?? '-';

    // Plain caption (no markdown) so URLs & symbols stay clean
    let caption = `乂  I G  S T A L K E R  —  P R O F I L E\n\n`;
    caption += `╭─❒ User Info\n`;
    caption += `│◦ Username : ${username}\n`;
    caption += `│◦ Full Name : ${fullName}\n`;
    caption += `│◦ Bio : ${bio}\n`;
    caption += `╰──────\n\n`;
    caption += `╭─❒ Statistics\n`;
    caption += `│◦ Followers : ${followers}\n`;
    caption += `│◦ Following : ${following}\n`;
    caption += `│◦ Total Posts : ${posts}\n`;
    caption += `╰──────\n\n`;
    caption += `🔗 Profile: https://instagram.com/${username}\n\n`;
    caption += `(*/ω＼*) Here you go~ nya! ✨`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: avatar },
        caption, // plain text (no parse mode)
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    m.reply(`Couldn’t fetch that username… gomen~ (╥﹏╥)\nReason: ${e?.message || e}`);
  }
};

handler.help = ['igstalk'];
handler.tags = ['stalk'];
handler.command = /^(igstalk|instagramstalk|instastalk)$/i;

handler.register = true
handler.limit = true

export default handler
