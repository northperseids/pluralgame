const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'viewplayers',
    description: 'View players for the current game.',
    integration_types: [0, 1],
    contexts: [0],
    type: ApplicationCommandOptionType.Subcommand,
    callback: async (client, interaction) => {
        const conns = await openConns();

        const prom = new Promise(async (resolve) => {
            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conns[1].query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
                resolve()
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
                resolve()
            } else {
                // MAIN COMMAND CODE
                let playersquery = "SELECT playername, playeremoji, points FROM players WHERE gameid=?";
                const players = await conns[1].query(playersquery, [gameid]);
                let playerstring = "";
                players.forEach(player => {
                    playerstring += `${capitalized(player['playername'])} - ${player['playeremoji']} - ${player['points']} points\n`;
                });
                interaction.reply(`**Players:**\n${playerstring}`);
                resolve()
            }
        })

        await prom.then(() => { closeConns(conns) });
    }
}