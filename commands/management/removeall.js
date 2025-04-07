const closeConns = require('../../utils/closeConns');
const openConns = require('../../utils/openConns');

module.exports = {
    name: 'removeall',
    description: 'Remove all players associated with your system/account from the game.',
    integration_types: [0, 1],
    contexts: [0],
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];
        const prom = new Promise(async (resolve) => {

            // remove player
            let sql = "SELECT COUNT(*), gameid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
                resolve()
            } else {
                // check if players exist associated with this user id
                let playersql = "SELECT COUNT(*) FROM players WHERE gameid=? AND userid=?";
                const players = await conn.query(playersql, [game[0]['gameid'], interaction.user.id]);
                // if player exists and user account is associated with player
                if (players[0]['COUNT(*)'] > 0) {
                    // remove player
                    let sql2 = "DELETE FROM players WHERE gameid=? AND userid=?";
                    await conn.query(sql2, [game[0]['gameid'], interaction.user.id]);
                    interaction.reply(`${players[0]['COUNT(*)']} players removed from game!`);
                    resolve()
                } else {
                    interaction.reply({ content: `Sorry, no players can be removed that are associated with this account.`, ephemeral: true });
                    resolve()
                }
            }
        })
        await prom.then(() => {
            closeConns(conns);
        })
    }
}