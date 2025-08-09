import fetch from 'node-fetch'

function fmtNum(n) {
  if (n === null || n === undefined) return '-';
  return Number(n).toLocaleString('en-US');
}

function fmtDate(s) {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  } catch {
    return s;
  }
}

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return m.reply(
      `Usage:\n${usedPrefix + command} <username>\n` +
      `Example: ${usedPrefix + command} ShirokamiRyzen\n` +
      `Please provide a GitHub username, nya~ (≧ω≦)ゞ`
    );
  }

  try {
    const url = `${APIs.ryzumi}/api/stalk/github?username=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const u = await res.json();

    if (!u?.login) throw new Error('User not found or empty API response');

    const avatarUrl = u.avatar_url || '';
    const username  = u.login || text;
    const name      = u.name || '-';
    const id        = u.id ?? '-';
    const nodeId    = u.node_id || '-';
    const type      = u.type || '-';
    const company   = u.company || '-';
    const blog      = u.blog || '-';
    const location  = u.location || '-';
    const bio       = u.bio || '-';
    const repos     = fmtNum(u.public_repos);
    const gists     = fmtNum(u.public_gists);
    const followers = fmtNum(u.followers);
    const following = fmtNum(u.following);
    const createdAt = fmtDate(u.created_at);
    const updatedAt = fmtDate(u.updated_at);

    let caption =
`乂  G I T H U B  S T A L K E R  —  P R O F I L E

╭─❒ User Info
│◦ Username : ${username}
│◦ Name     : ${name}
│◦ ID       : ${id}
│◦ Node ID  : ${nodeId}
│◦ Type     : ${type}
│◦ Company  : ${company}
│◦ Blog     : ${blog}
│◦ Location : ${location}
│◦ Bio      : ${bio}
╰──────

╭─❒ Statistics
│◦ Repos    : ${repos}
│◦ Gists    : ${gists}
│◦ Followers: ${followers}
│◦ Following: ${following}
│◦ Created  : ${createdAt}
│◦ Updated  : ${updatedAt}
╰──────

🔗 Profile: https://github.com/${username}

(*/ω＼*) Here you go~ nya! ✨`;

    if (avatarUrl) {
      await conn.sendFile(m.chat, avatarUrl, 'avatar.jpg', caption, m);
    } else {
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    }

  } catch (e) {
    console.error(e);
    m.reply(`Couldn't fetch that username… gomen~ (╥﹏╥)\nReason: ${e?.message || e}`);
  }
};

handler.help = ['ghstalk <username>'];
handler.tags = ['stalk'];
handler.command = /^(ghstalk|githubstalk)$/i;

handler.register = true
handler.limit = true

export default handler
