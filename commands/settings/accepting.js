const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');
const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');

module.exports = {
    name: 'accepting',
    description: 'Enable or disable accepting new players.',
    integration_types: [0, 1],
    contexts: [0],
    options: [
        {
            name: 'playertoggle',
            description: 'true=enabled, false=disabled',
            type: ApplicationCommandOptionType.Boolean,
            required: true
        }
    ],
    type: ApplicationCommandOptionType.Subcommand,
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];

        const prom = new Promise(async (resolve) => {
            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
                resolve()
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, flags: MessageFlags.Ephemeral });
                resolve()
            } else {
                // MAIN COMMAND CODE
                let configquery = "UPDATE games SET acceptplayers=? WHERE gameid=?";
                let toggle = 0;
                let bool = interaction.options.get('playertoggle').value;
                if (bool === true) {
                    toggle = 1;
                }
                await conn.query(configquery, [toggle, gameid]);
                interaction.reply(`Accepting new players ${toggle === 1 ? 'enabled' : 'disabled'}.`)
                resolve()
            }
        })

        await prom.then(() => { closeConns(conns) });
    }
}