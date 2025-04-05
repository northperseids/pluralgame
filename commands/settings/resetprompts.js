const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');

module.exports = {
    name: 'resetprompts',
    description: 'Reset and clear the prompt queue.',
    integration_types: [0, 1],
    contexts: [0],
    subcommand: true,
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];

        const prom = new Promise(async (resolve) => {
            // check for a game session in the current channel and whether or not the host is the one who issued the command
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
                let configquery = "DELETE FROM gametracking WHERE gameid=?";
                await conn.query(configquery, [gameid]).then(() => {
                    interaction.reply(`Prompt history cleared!`);
                }).then(() => { resolve() })
            }
        })

        await prom.then(() => { closeConns(conns) });
    }
}