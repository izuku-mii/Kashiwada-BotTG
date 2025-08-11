import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `Usage:\n${usedPrefix + command} <username>\n` +
      `Example: ${usedPrefix + command} shirokami_ryzen\n` +
      `Please provide a TikTok username, nya~ (≧ω≦)ゞ`
    );
  }

  try {
    await m.reply(wait);
    const url = `${APIs.ryzumi}/api/stalk/tiktok?username=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();

    const u = data?.userInfo;
    if (!u) return m.reply(`Username not found or API error… gomen~ (╥﹏╥)`);

    const followers = (u.totalFollowers ?? 0).toLocaleString('en-US');
    const following = (u.totalFollowing ?? 0).toLocaleString('en-US');
    const likes     = (u.totalLikes ?? 0).toLocaleString('en-US');
    const videos    = (u.totalVideos ?? 0).toLocaleString('en-US');
    const friends   = (u.totalFriends ?? 0).toLocaleString('en-US');

    // Plain-text caption (no markdown) so URLs & symbols stay clean
    let caption = `乂  T T  S T A L K E R  —  P R O F I L E\n\n`;
    caption += `╭─❒ User Info\n`;
    caption += `│◦ Username : ${u.username}\n`;
    caption += `│◦ Name : ${u.name || '-'}\n`;
    caption += `│◦ ID : ${u.id}\n`;
    caption += `│◦ Bio : ${u.bio || '-'}\n`;
    caption += `│◦ Verified : ${u.verified ? 'Yes' : 'No'}\n`;
    caption += `╰──────\n\n`;
    caption += `╭─❒ Statistics\n`;
    caption += `│◦ Followers : ${followers}\n`;
    caption += `│◦ Following : ${following}\n`;
    caption += `│◦ Likes : ${likes}\n`;
    caption += `│◦ Videos : ${videos}\n`;
    caption += `│◦ Friends : ${friends}\n`;
    caption += `╰──────\n\n`;
    caption += `🔗 Profile: https://tiktok.com/@${u.username}\n\n`;
    caption += `(*/ω＼*) Here you go~ nya! ✨`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: u.avatar },
        caption, // plain text
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    m.reply(`Couldn't fetch that username… gomen~ (╥﹏╥)\nReason: ${e?.message || e}`);
  }
};

handler.help = ['ttstalk'];
handler.tags = ['stalk'];
handler.command = /^(ttstalk|tiktokstalk)$/i;

handler.register = true
handler.limit = true

export default handler
