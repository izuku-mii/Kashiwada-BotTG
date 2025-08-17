import cp from 'child_process';
import { promisify } from 'util';
const exec = promisify(cp.exec).bind(cp);

function escapeMarkdown(text) {
  return text.toString()
    .replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
}

const handler = async (m, { conn, isOwner, command, text }) => {
  let o;
  try {
    o = await exec(command.trimStart() + ' ' + text.trimEnd());
  } catch (e) {
    o = e;
  } finally {
    let { stdout, stderr } = o;
    const stdoutOutput = escapeMarkdown(stdout)
    const stderrOutput = escapeMarkdown(stderr)
    
    if (stdoutOutput.length > 4096) {
      await m.reply('Output terlalu panjang, dipotong...', m)
      await m.reply(stdoutOutput.substring(0, 4000) + '...', m)
    } else {
      await m.reply(stdoutOutput, m)
    }
    
    if (stderrOutput.length > 4096) {
      await m.reply('Output terlalu panjang, dipotong...', m)
      await m.reply(stderrOutput.substring(0, 4000) + '...', m)
    } else {
      await m.reply(stderrOutput, m)
    }
  }
};

handler.customPrefix = /^[$] /;
handler.command = new RegExp();
handler.rowner = true;

export default handler;
