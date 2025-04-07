const closeConns = require('../../utils/closeConns');
const openConns = require('../../utils/openConns');

module.exports = {
    name: 'end',
    description: 'End the game in this channel!',
    integration_types: [0, 1],
    contexts: [0],
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];
        const prom = new Promise(async (resolve) => {
            // sql query
            let sql = "SELECT hostid, gameid FROM games WHERE guildid=? AND channelid=?";

            const rows = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (rows.length === 0) {
                interaction.reply(`No game open in this channel!`)
                resolve()
            } else if (rows[0]['hostid'] === interaction.user.id) {
                // Show winner(s)
                let playersquery = "SELECT playername, playeremoji, points FROM players WHERE gameid=?";
                const players = await conn.query(playersquery, [rows[0]['gameid']]);
                let playerstring = "";

                if (players.length > 0) {
                    const winner = players.reduce(function (prev, current) {
                        return (prev && prev.points > current.points) ? prev : current
                    });
                    players.forEach(player => {
                        playerstring += `${player['playername']} - ${player['playeremoji']} - ${player['points']} points\n`;
                    });
                    interaction.reply(`**Players:**\n${playerstring}\nLooks like ${winner.playername} won! Congratulations!`);
                } else {
                    interaction.reply(`No players in game. Game closed.`);
                }

                // then close game
                // delete game from games
                sql = "DELETE FROM games WHERE gameid=?";
                try {
                    await conn.query(sql, [rows[0]['gameid']]);
                } catch (err) {
                    interaction.reply(`Error closing game ${rows[0]['gameid']}.`)
                    resolve()
                }
                // delete players
                sql = "DELETE FROM players WHERE gameid=?";
                try {
                    await conn.query(sql, [rows[0]['gameid']]);
                } catch (err) {
                    interaction.reply(`Error closing game ${rows[0]['gameid']}.`)
                    resolve()
                }
                // clear gametracking
                sql = "DELETE FROM gametracking WHERE gameid=?";
                try {
                    await conn.query(sql, [rows[0]['gameid']]);
                } catch (err) {
                    interaction.reply(`Error closing game ${rows[0]['gameid']}.`)
                    resolve()
                }
                // clear responses
                sql = "DELETE FROM responses WHERE gameid=?";
                try {
                    await conn.query(sql, [rows[0]['gameid']]);
                } catch (err) {
                    interaction.reply(`Error closing game ${rows[0]['gameid']}.`)
                    resolve()
                }

                resolve()
            } else {
                interaction.reply({ content: `You aren't the host! The host is the only one who can close the game.`, ephemeral: true });
                resolve()
            }
        })
        await prom.then(() => {
            closeConns(conns);
        })
    }
}