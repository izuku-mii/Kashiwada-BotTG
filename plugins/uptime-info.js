let Izumi = async (m) => {
    function formatMS(ms) {
        let days = Math.floor(ms / 86400000);
        ms %= 86400000;
        let hours = Math.floor(ms / 3600000);
        ms %= 3600000;
        let minutes = Math.floor(ms / 60000);
        ms %= 60000;
        let seconds = Math.floor(ms / 1000);
        return String(days).padStart(2, '0') + ': hari, ' +
            String(hours).padStart(2, '0') + ': jam, ' +
            String(minutes).padStart(2, '0') + ': menit, ' +
            String(seconds).padStart(2, '0') + ': second';
    };
    await m.reply(formatMS(process.uptime() * 1000));
};

Izumi.command = /^(uptime|runtime)$/i;
Izumi.help = ["uptime", "runtime"];
Izumi.tags = ["info"];

export default Izumi;
