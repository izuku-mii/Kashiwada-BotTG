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

let handler = async (m, { conn, args, usedPrefix, command }) => {
	if (!args[0]) {
		return m.reply(
			`Usage:\n${usedPrefix + command} <threads url>\n` +
			`Example: ${usedPrefix + command} https://www.threads.net/@githubprojects/post/DNSpGU1zskx`
		);
	}

	try {
		await m.reply(wait)
		const url = args[0]
		const api = `${APIs.ryzumi}/api/downloader/threads?url=${encodeURIComponent(url)}`
		const res = await fetch(api, { headers: { accept: 'application/json' } })
		if (!res.ok) throw new Error(`API request failed (${res.status})`)
		const data = await res.json()

		const images = Array.isArray(data?.image_urls) ? data.image_urls.filter(Boolean) : []
		const videos = Array.isArray(data?.video_urls) ? data.video_urls.filter(Boolean) : []
		if (images.length === 0 && videos.length === 0) throw new Error('No media found')

		const uname = getDisplayName(m, conn)
		let sentAny = false

		// Send images first (if any)
		for (let i = 0; i < images.length; i++) {
			const caption = !sentAny ? `Here's your media, ${uname} ~ ✨` : ''
			sentAny = true
			try {
				await conn.sendMessage(m.chat, { image: { url: images[i] }, caption }, { quoted: m })
			} catch (e) {
				console.error('Threads image send error:', e)
			}
		}

		// Then videos
		for (let i = 0; i < videos.length; i++) {
			const caption = !sentAny ? `Here's your media, ${uname} ~ ✨` : ''
			sentAny = true
			try {
				await conn.sendMessage(
					m.chat,
					{ video: { url: videos[i] }, mimetype: 'video/mp4', fileName: `threads-${i + 1}.mp4`, caption },
					{ quoted: m }
				)
			} catch (e) {
				console.error('Threads video send error:', e)
			}
		}

	} catch (err) {
		console.error('Threads Download Error:', err)
		await conn.reply(m.chat, `An error occurred: ${err?.message || err}`, m)
	}
}

handler.help = ['threads']
handler.tags = ['downloader']
handler.command = /^(threads)$/i

handler.limit = true
handler.register = true

export default handler

