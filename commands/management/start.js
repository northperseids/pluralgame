const closeConns = require('../../utils/closeConns');
const openConns = require('../../utils/openConns');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'start',
    description: 'Start a game in this channel!',
    integration_types: [0, 1],
    contexts: [0],
    options: [
        {
            name: 'timers',
            description: 'Enable or disable timers',
            type: ApplicationCommandOptionType.Boolean,
            required: true
        },
        {
            name: 'adultcontent',
            description: 'Enable or disable adult content',
            type: ApplicationCommandOptionType.Boolean,
            required: true
        }
    ],
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];
        const prom = new Promise(async (resolve) => {
            // see if game already exists in this channel
            let sql = "SELECT COUNT(*) FROM games WHERE guildid=? AND channelid=?";
            const rows = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (rows[0]['COUNT(*)'] == 1) {
                interaction.reply(`Game is already open in this channel! Either close it or begin play.`);
            } else {
                let timersEnabled = interaction.options.get('timers').value === true ? 1 : 0;
                let adultEnabled = interaction.options.get('adultcontent').value === true ? 1 : 0;

                // start game
                let startGame = "INSERT INTO games (guildid, channelid, hostid, startdate, timers, adult, acceptplayers) VALUES (?, ?, ?, now(), ?, ?, ?)";
                try {
                    await conn.query(startGame, [interaction.guildId, interaction.channelId, interaction.user.id, timersEnabled, adultEnabled, 1]);
                    interaction.reply(`Game opened by ${interaction.user.username}!\n\nTimers: ${timersEnabled === 0 ? 'Disabled' : 'Enabled'}\nAdult content: ${adultEnabled === 0 ? 'Disabled' : 'Enabled'}\nAccepting Players: Enabled\n\nParticipants can now add players with /add.`);
                    resolve()
                } catch (err) {
                    interaction.reply(`Error ${err}`);
                    resolve()
                }
            }
        })
        await prom.then(() => {
            closeConns(conns);
        })
    }
}