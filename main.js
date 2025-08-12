import './config.js'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { Telegraf } from 'telegraf'
import { fileURLToPath, pathToFileURL } from 'url'

// Database (lowdb lite bundled in lib/lowdb)
import { Low, JSONFile } from './lib/lowdb/index.js'

// Core handler and helpers
import * as Core from './handler.js'
import attachSimpleHelpers from './lib/simple.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---- Basic guards
if (!global.token || String(global.token).trim().length === 0) {
	console.error('\u274c Missing bot token. Set global.token in config.js')
	process.exit(1)
}

// Normalize ownerid/premid to arrays of strings
const normalizeIds = (v) => Array.isArray(v)
	? v.map(x => String(x))
	: String(v || '')
			.split(/[\s,]+/)
			.map(x => x.trim())
			.filter(Boolean)
global.ownerid = normalizeIds(global.ownerid)
global.premid = normalizeIds(global.premid)
global.prefix = Array.isArray(global.prefix) ? global.prefix : ['/', '.', '#', '!']
global.opts = global.opts || {}

// ---- Database setup
const dbFile = path.join(__dirname, 'database.json')
const adapter = new JSONFile(dbFile)
const db = new Low(adapter)
global.db = db

const defaultDB = {
	users: {},
	chats: {},
	stats: {},
	msgs: {},
	sticker: {},
}

let dbLoadedOnce = false
let dbSaving = false
let dbDirty = false

async function loadDatabase() {
	await db.read()
	if (!db.data) db.data = JSON.parse(JSON.stringify(defaultDB))
	// Fill defaults (non-destructive)
	for (const k of Object.keys(defaultDB)) db.data[k] = db.data[k] || JSON.parse(JSON.stringify(defaultDB[k]))
	dbLoadedOnce = true
}

async function saveDatabase() {
	if (!dbLoadedOnce) return
	if (dbSaving) { dbDirty = true; return }
	dbSaving = true
	try {
		await db.write()
	} finally {
		dbSaving = false
		if (dbDirty) { dbDirty = false; setImmediate(saveDatabase) }
	}
}

global.loadDatabase = loadDatabase

// Periodic autosave
setInterval(() => saveDatabase().catch(() => {}), 15_000)

// ---- Plugins loader
const pluginsDir = path.join(__dirname, 'plugins')
global.plugins = {}

async function loadPlugins() {
	const list = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
	const newMap = {}
	for (const file of list) {
		try {
			const full = path.join(pluginsDir, file)
			const fileUrl = pathToFileURL(full).href + `?v=${Date.now()}`
			const mod = await import(fileUrl)
			newMap[file] = mod.default || mod
		} catch (e) {
			console.error(`Failed loading plugin ${file}:`, e.message)
		}
	}
	global.plugins = newMap
	console.log(chalk.green(`\u2705 Loaded ${Object.keys(global.plugins).length} plugins`))
}

// Watch plugins for hot-reload (best-effort)
try {
	fs.watch(pluginsDir, { persistent: false }, async (event, filename) => {
		if (!filename || !filename.endsWith('.js')) return
		try { await loadPlugins() } catch {}
	})
} catch {}

// ---- Bot setup
const bot = new Telegraf(global.token)
// Use bot instance as conn so .on() is available for simple.js middleware
const conn = bot
conn.botInfo = null

// Attach friendly helpers to conn (adds sendMessage/sendFile/reply/etc and a message middleware)
attachSimpleHelpers(conn)

// getName helper cache enhancer (will fallback to simple.js default until cache fills)
const nameCache = new Map()

async function refreshBotInfo() {
	try {
		conn.botInfo = await bot.telegram.getMe()
		// Enhance getName with async lookup once (cache lazily)
		conn.getName = (id) => {
			const key = String(id)
			if (nameCache.has(key)) return nameCache.get(key)
			;(async () => {
				try {
					// getChat works for users/groups
					const chat = await bot.telegram.getChat(id)
					const name = chat.first_name || chat.title || chat.username || String(id)
					nameCache.set(key, name)
				} catch {
					nameCache.set(key, String(id))
				}
			})()
			return key
		}
	} catch (e) {
		console.error('Failed to fetch bot info:', e.message)
	}
}

// Build message object compatible with handler.js and plugins
async function buildMessage(ctx) {
	const msg = ctx.message || ctx.editedMessage || ctx.channelPost || ctx.editedChannelPost || {}
	const chat = ctx.chat || msg.chat || {}
	const from = ctx.from || msg.from || {}
	// Support callback query data as synthetic text so plugins can parse it like a normal command
	const cbData = ctx.callbackQuery?.data

	const isGroup = chat.type === 'group' || chat.type === 'supergroup'
	const text = msg.text || msg.caption || cbData || ''

	// IDs
	const chatId = chat.id
	const senderId = from.id

	// Permissions (best-effort, safe-defaults)
	let isBotAdmin = false
	let isAdmin = false
	if (isGroup && chatId && conn.botInfo?.id) {
		try {
			const botMember = await bot.telegram.getChatMember(chatId, conn.botInfo.id)
			isBotAdmin = ['administrator', 'creator'].includes(botMember.status)
		} catch {}
		try {
			const userMember = await bot.telegram.getChatMember(chatId, senderId)
			isAdmin = ['administrator', 'creator'].includes(userMember.status)
		} catch {}
	}

	const m = {
		id: msg.message_id,
		chat: chatId,
		sender: senderId,
		name: from.first_name || from.username || 'Unknown',
		text,
		isGroup,
		isAdmin,
		isBotAdmin,
		fromMe: false,
		isSimulated: false,
		callbackQuery: ctx.callbackQuery || null,
		participants: [],
		quoted: null,
		fakeObj: ctx.update, // For print logger
		reply: (txt, quoted) => conn.sendMessage(chatId, { text: txt }, { quoted: quoted || { message_id: msg.message_id } })
	}

	// participants (admins list as best-effort)
	if (isGroup) {
		try {
			const admins = await bot.telegram.getChatAdministrators(chatId)
			m.participants = admins.map(a => a.user.id)
		} catch {}
	}

	return m
}

// ---- Wiring updates
bot.on('message', async (ctx) => {
	try {
		await loadDatabase()
		const m = await buildMessage(ctx)
		await Core.handler.call(conn, m)
		saveDatabase().catch(() => {})
	} catch (e) {
		console.error('Update error:', e)
	}
})

// Callback queries (buttons)
bot.on('callback_query', async (ctx) => {
	try {
		await loadDatabase()
		const m = await buildMessage(ctx)
		await Core.handler.call(conn, m)
		saveDatabase().catch(() => {})
	} catch (e) {
		console.error('Callback error:', e)
	}
})

// Participant updates (join/leave, bot status)
bot.on('my_chat_member', async (ctx) => {
	try { await Core.participantsUpdate.call(conn, ctx) } catch (e) { console.error(e) } 
})
bot.on('chat_member', async (ctx) => {
	try { await Core.participantsUpdate.call(conn, ctx) } catch (e) { console.error(e) }
})

// ---- Boot
;(async () => {
	try {
		await loadDatabase()
	await loadPlugins()
		await refreshBotInfo()
		await bot.launch()
		console.log(chalk.cyan(`\u2705 ${global.botname || 'Bot'} is up and running as @${conn.botInfo?.username || 'unknown'}`))
	} catch (e) {
		console.error('\u274c Failed to launch bot:', e)
		process.exit(1)
	}
})()

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

// Hot-reload support
fs.watchFile(__filename, () => {
	fs.unwatchFile(__filename)
	console.log(chalk.redBright('Update main.js'))
})

// Parent IPC helpers
process.on('message', (msg) => {
	if (msg === 'uptime') {
		try { process.send && process.send(process.uptime()) } catch {}
	}
})