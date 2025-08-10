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

function sanitizeSegment(name = '') {
	// Keep letters/numbers/space/underscore/dash/parentheses, replace others with space
	const cleaned = String(name)
		.replace(/[^\w\s()\-]+/g, ' ') // remove illegal filename chars except _ - ( )
		.replace(/\s+/g, ' ') // collapse spaces
		.trim();
	// Convert spaces to underscores
	return cleaned.replace(/\s+/g, '_');
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
	if (!args[0]) {
		return m.reply(
			`Usage:\n${usedPrefix + command} <spotify track url>\n` +
			`Example: ${usedPrefix + command} https://open.spotify.com/track/6CRX3ENpLq42r0iBSjOqr1`
		);
	}

	try {
		await m.reply(typeof wait !== 'undefined' ? wait : 'Please wait...');

		const url = args[0];
		const api = `${APIs.ryzumi}/api/downloader/spotify?url=${encodeURIComponent(url)}`;
		const res = await fetch(api, { headers: { accept: 'application/json' } });
		if (!res.ok) throw new Error(`API request failed (${res.status})`);

		const json = await res.json();
		if (!json?.success || !json?.link) throw new Error('Failed to fetch Spotify audio');

		const meta = json.metadata || {};
	const title = meta.title || 'Spotify Track';
	const artists = meta.artists || meta.artist || 'Unknown Artist';
		const album = meta.album || '';
		const cover = meta.cover || '';
		const releaseDate = meta.releaseDate || meta.release_date || '';
		const isrc = meta.isrc || '';

	// Build filename like: Title_(Ku_Berharap)-Hijau_Daun.mp3
	const artistsStr = Array.isArray(artists) ? artists.join(', ') : String(artists);
	const fileName = `${sanitizeSegment(title)}-${sanitizeSegment(artistsStr)}.mp3`;
		const uname = getDisplayName(m, conn);
		const captionParts = [
			`Here’s your track, ${uname} ~ ✨`,
			`Title: ${title}`,
			`Artists: ${artists}`,
		];
		if (album) captionParts.push(`Album: ${album}`);
		if (releaseDate) captionParts.push(`Release: ${releaseDate}`);
		if (isrc) captionParts.push(`ISRC: ${isrc}`);
		const caption = captionParts.join('\n');

		// Try to send cover first (optional, non-blocking)
		if (cover) {
			try {
				await conn.sendMessage(
					m.chat,
					{ image: { url: cover }, caption: caption },
					{ quoted: m }
				);
			} catch {}
		}

		await conn.sendMessage(
			m.chat,
			{
				audio: { url: json.link },
				mimetype: 'audio/mpeg',
				fileName,
				caption,
				title,
				performer: artists,
				thumbnail: cover || undefined,
			},
			{ quoted: m }
		);

	} catch (err) {
		console.error('Spotify Download Error:', err);
		await conn.reply(m.chat, `An error occurred: ${err?.message || err}`, m);
	}
};

handler.help = ['spotify'];
handler.tags = ['downloader'];
handler.command = /^(spotify|spoti|spdl)$/i;

handler.limit = true
handler.register = true

export default handler

