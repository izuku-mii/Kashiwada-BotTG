// Don't delete this credit!!!
// Script by ShirokamiRyzen

import fetch from 'node-fetch'

function getDisplayName(m, conn) {
	const from =
		m.from ||
		m.fakeObj?.message?.from ||
		m.message?.from ||
		m.quoted?.fakeObj?.message?.from ||
		null;

	if (from?.username) return `@${from.username}`;
	if (from?.first_name && from?.last_name) return `${from.first_name} ${from.last_name}`;
	if (from?.first_name) return from.first_name;

	try {
		const n = conn?.getName?.(m.sender);
		if (n) return n;
	} catch {}
	return 'nya~';
}

// Escape text (MarkdownV2)
const tgEscapeText = (s = '') =>
	String(s).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')

const tgEscapeUrl = (s = '') =>
	String(s).replace(/[\(\)\\]/g, '\\$&')

let handler = async (m, { conn, args, usedPrefix, command }) => {
	if (!args[0]) {
		return m.reply(
			`Usage:\n${usedPrefix + command} <danbooru url>\n` +
			`Example: ${usedPrefix + command} https://danbooru.donmai.us/posts/8391757`
		);
	}

	let fileUrl;

	try {
		await m.reply(typeof wait !== 'undefined' ? wait : 'Please wait...');

		const url = args[0];
		const api = `${APIs.ryzumi}/api/downloader/danbooru?url=${encodeURIComponent(url)}`;
		const res = await fetch(api, { headers: { accept: 'application/json' } });
		if (!res.ok) throw new Error(`API request failed (${res.status})`);

		const data = await res.json();
		fileUrl = data?.url;
		if (!fileUrl || typeof fileUrl !== 'string') throw new Error('No downloadable media found');

		const uname = getDisplayName(m, conn);

		const sourceUrlRaw = data?.Source
			? (data.Source.startsWith('http') ? data.Source : `https://${data.Source}`)
			: null;

		const lines = [
			`Here's your Danbooru media, ${tgEscapeText(uname)} ~ ✨`,
			'',
			data?.ID && `• ID: ${tgEscapeText(data.ID)}`,
			data?.Uploader && `• Uploader: ${tgEscapeText(data.Uploader)}`,
			data?.Rating && `• Rating: ${tgEscapeText(data.Rating)}`,
			data?.Score && `• Score: ${tgEscapeText(data.Score)}`,
			data?.Favorites && `• Favorites: ${tgEscapeText(data.Favorites)}`,
			data?.Size && `• Size: ${tgEscapeText(data.Size)}`,
			data?.Status && `• Status: ${tgEscapeText(data.Status)}`,
			sourceUrlRaw && `• Source: [${tgEscapeText(data.Source)}](${tgEscapeUrl(sourceUrlRaw)})`
		].filter(Boolean);

		const caption = lines.join('\n');

		const isVideo = /\.(mp4|webm|mkv|mov)(\?|#|$)/i.test(fileUrl);

		if (isVideo) {
			await conn.sendMessage(
				m.chat,
				{
					video: { url: fileUrl },
					mimetype: 'video/mp4',
					fileName: 'danbooru-video.mp4',
					caption
				},
				{ quoted: m }
			);
		} else {
			await conn.sendMessage(
				m.chat,
				{ image: { url: fileUrl }, caption },
				{ quoted: m }
			);
		}

	} catch (e) {
		let errMsg = `An error occurred: ${e?.message || e}`;
		if (typeof fileUrl === 'string') errMsg += `\nURL: ${fileUrl}`;
		await conn.reply(m.chat, tgEscapeText(errMsg), m);
	}
};

handler.help = ['danbooru'];
handler.tags = ['downloader'];
handler.command = /^(danbooru|booru)$/i;

handler.limit = true
handler.register = true

export default handler
