const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'adult',
    description: 'Adjust the adult-content settings.',
    integration_types: [0, 1],
    contexts: [0],
    options: [
        {
            name: 'adulttoggle',
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
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
                resolve()
            } else {
                // MAIN COMMAND CODE
                let configquery = "UPDATE games SET adult=? WHERE gameid=?";
                let toggle = 0;
                let bool = interaction.options.get('adulttoggle').value;
                if (bool === true) {
                    toggle = 1;
                }
                await conn.query(configquery, [toggle, gameid]);
                interaction.reply(`Adult content ${toggle === 1 ? 'enabled' : 'disabled'}.`)
                resolve()
            }
        })

        await prom.then(() => { closeConns(conns) });
    }
}