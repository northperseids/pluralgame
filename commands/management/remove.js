const closeConns = require('../../utils/closeConns');
const openConns = require('../../utils/openConns');
const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');

module.exports = {
    name: 'remove',
    description: 'Remove a player from the game.',
    integration_types: [0, 1],
    contexts: [0],
    options: [
        {
            name: 'playername',
            description: 'Player Name',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];
        const prom = new Promise(async (resolve) => {

            let playername = interaction.options.get('playername').value;

            // remove player
            let sql = "SELECT COUNT(*), gameid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
                resolve()
            } else {
                // if host, allow remove
                let hostsql = "SELECT hostid FROM games WHERE gameid=?";
                const host = await conn.query(hostsql, [game[0]['gameid']]);
                // check if player exists associated with this user id
                let playersql = "SELECT COUNT(*), userid FROM players WHERE gameid=? AND playername=?";
                const player = await conn.query(playersql, [game[0]['gameid'], playername.toLowerCase()]);
                // if user is host and player exists OR player exists and user account is associated with player
                if (host[0]['hostid'] === interaction.user.id && player[0]['COUNT(*)'] == 1 || player[0]['COUNT(*)'] == 1 && player[0]['userid'] === interaction.user.id) {
                    // remove player
                    let sql2 = "DELETE FROM players WHERE gameid=? AND playername=?";
                    await conn.query(sql2, [game[0]['gameid'], playername]);
                    interaction.reply(`Player ${playername} removed from game!`);
                    resolve()
                } else {
                    if (host[0]['hostid'] === interaction.user.id) {
                        interaction.reply({ content: `Sorry, no player by name ${playername}.`, flags: MessageFlags.Ephemeral })
                    } else {
                        interaction.reply({ content: `Sorry, no player by name ${playername} associated with this account.`, flags: MessageFlags.Ephemeral })
                    }
                    resolve()
                }
            }
        })
        await prom.then(() => {
            closeConns(conns);
        })
    }
}