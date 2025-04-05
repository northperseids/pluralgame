const closeConns = require('../../utils/closeConns');
const openConns = require('../../utils/openConns');

module.exports = {
    name: 'closeall',
    description: 'Close all games in this server.',
    integration_types: [0, 1],
    contexts: [0],
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];
        const prom = new Promise(async (resolve) => {
            if (interaction.member.permissions.has('Administrator')) {

                // get game IDs list
                let getGameID = "SELECT gameid FROM games WHERE guildid=?";
                let gameIDs = await conn.query(getGameID, [interaction.guildId]);

                // if no games open, say so
                if (gameIDs.length === 0) {
                    interaction.reply(`No games open in this server.`);
                    resolve()
                }

                // close game
                // delete game from games
                sql = "DELETE FROM games WHERE guildid=?";
                try {
                    await conn.query(sql, [interaction.guildId]);
                } catch (err) {
                    interaction.reply(`Error closing game ${interaction.guildId}.`)
                    resolve()
                }

                // delete players
                sql = "DELETE FROM players WHERE guildid=?";
                try {
                    await conn.query(sql, [interaction.guildId]);
                } catch (err) {
                    interaction.reply(`Error closing game ${interaction.guildId}.`)
                    resolve()
                }

                // clear gametracking
                sql = "DELETE FROM gametracking WHERE gameid=?";
                try {
                    gameIDs.forEach(async game => {
                        await conn.query(sql, [game['gameid']]);
                    });
                } catch (err) {
                    interaction.reply(`Error closing game ${interaction.guildId}.`)
                    resolve()
                }

                // clear responses
                sql = "DELETE FROM responses WHERE gameid=?";

                try {
                    gameIDs.forEach(async game => {
                        await conn.query(sql, [game['gameid']])
                    });
                    interaction.reply(`Games closed!`);
                    resolve()
                } catch (err) {
                    console.log(err)
                    interaction.reply(`Error closing games.`)
                    resolve()
                }
            } else {
                interaction.reply({ content: `You have to be an admin to run this command!`, ephemeral: true });
                resolve()
            }
        })
        await prom.then(() => {
            closeConns(conns);
        })
    }
}