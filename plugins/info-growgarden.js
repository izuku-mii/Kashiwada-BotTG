import fetch from 'node-fetch'
import moment from 'moment-timezone'

let handler = async (m) => {
    try {
        m.reply(wait)

        // Fetch data
        let res = await (await fetch(`${APIs.ryzumi}/api/tool/growagarden`)).json()
        if (!res.data) return m.reply('Failed to fetch data.')

        let garden = res.data
        let content = `*🌱 GROW A GARDEN STOCKS + WEATHER 🌱*\n\n`

        const formatItem = (item) => {
            let time = moment(item.lastUpdated).tz('Asia/Jakarta').format('DD MMM YYYY, HH:mm:ss') + ' WIB'
            return `  ◦ ${item.name} (${item.quantity}) ${item.available ? '✅' : '❌'}\n    Updated: ${time}\n`
        }

        // Seeds
        if (garden.seeds?.length) {
            content += `*🌾 Seeds:*\n`
            garden.seeds.forEach(i => content += formatItem(i))
            content += '\n'
        }

        // Gear
        if (garden.gear?.length) {
            content += `*🛠️ Gear:*\n`
            garden.gear.forEach(i => content += formatItem(i))
            content += '\n'
        }

        // Eggs
        if (garden.eggs?.length) {
            content += `*🥚 Eggs:*\n`
            garden.eggs.forEach(i => content += formatItem(i))
            content += '\n'
        }

        // Cosmetics
        if (garden.cosmetics?.length) {
            content += `*🎨 Cosmetics:*\n`
            garden.cosmetics.forEach(i => content += formatItem(i))
            content += '\n'
        }

        // Honey Items
        if (garden.honey?.length) {
            content += `*🍯 Honey Items:*\n`
            garden.honey.forEach(i => content += formatItem(i))
            content += '\n'
        }

        // Events
        if (garden.events?.length) {
            content += `*🎉 Events:*\n`
            garden.events.forEach(i => content += formatItem(i))
            content += '\n'
        }

        // Weather Now
        if (garden.weather) {
            let w = garden.weather
            let lastUpdate = moment(w.lastUpdated).tz('Asia/Jakarta').format('DD MMM YYYY, HH:mm:ss') + ' WIB'
            content += `*🌦️ Current Weather:* ${w.type.toUpperCase()}\n`
            w.effects.forEach(e => content += `  - ${e}\n`)
            content += `Last Update: ${lastUpdate}\n\n`
        }

        // Weather History
        if (garden.weatherHistory?.length) {
            content += `*📜 Weather History:*\n`
            garden.weatherHistory.forEach(h => {
                let start = moment(h.startTime).tz('Asia/Jakarta').format('DD MMM YYYY, HH:mm:ss') + ' WIB'
                let end = moment(h.endTime).tz('Asia/Jakarta').format('DD MMM YYYY, HH:mm:ss') + ' WIB'
                content += `  ◦ ${h.type.charAt(0).toUpperCase() + h.type.slice(1)} — ${start} → ${end}\n`
            })
        }

        await m.reply(content.trim())
    } catch (err) {
        m.reply(`❌ Error: ${err.message}`)
    }
}

handler.help = ['growgarden']
handler.command = ['growgarden', 'gag']
handler.tags = ['info']
handler.limit = 1

export default handler
