const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');
const capitalized = require('../../utils/capitalize');

module.exports = {
    name: 'timer',
    description: 'Adjust the timer settings.',
    integration_types: [0, 1],
    contexts: [0],
    subcommand: true,
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];

        const prom = new Promise(async (resolve) => {
            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                let configquery = "UPDATE games SET timers=? WHERE gameid=?";
                let toggle = 0;
                let bool = interaction.options.get('timertoggle').value;
                if (bool === true) {
                    toggle = 1;
                }
                interaction.reply(`Timers ${toggle === 1 ? 'enabled' : 'disabled'}.`)
                await conn.query(configquery, [toggle, gameid]).then(() => { resolve() })
            }
        })

        await prom.then(() => { closeConns(conns) });
    }
}