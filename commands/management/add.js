const closeConns = require('../../utils/closeConns');
const openConns = require('../../utils/openConns');
const emotes = require('../../utils/emotes');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'add',
    description: 'Add a player!',
    integration_types: [0, 1],
    contexts: [0],
    options: [
        {
            name: 'playername',
            description: 'Player Name (case sensitive)',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'playeremoji',
            description: 'Player Emoji (must be a standard Discord emoji - no custom ones, sorry!)',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];
        const prom = new Promise(async (resolve) => {
            let playername = interaction.options.get('playername').value;
            let playeremoji = emotes(interaction.options.get('playeremoji').value);

            if (!playeremoji || !playeremoji[0] || playeremoji.length > 1) {
                interaction.reply({ content: `Emoji needs to be a single valid emoji!`, ephemeral: true });
                resolve()
            } else {
                // reject if emoji or name already taken
                let emojis = "SELECT playeremoji, playername FROM players WHERE channelid=? AND guildid=?";
                try {
                    const playeremojis = await conn.query(emojis, [interaction.channelId, interaction.guildId ? interaction.guildId : interaction.channelId]);
                    for (i = 0; i < playeremojis.length; i++) {
                        if (playeremoji[0] === playeremojis[i]['playeremoji']) {
                            interaction.reply({ content: `Someone is already using the emoji ${playeremoji[0]}!`, ephemeral: true });
                            resolve()
                        } else if (playeremojis[i]['playername'] === playername) {
                            interaction.reply({ content: `Someone is already using the name ${playername}!`, ephemeral: true });
                            resolve()
                        }
                    }
                } catch (err) {
                    interaction.reply(`Error ${err}`);
                    resolve()
                }

                // reject if max players
                let countmembers = "SELECT COUNT(*) FROM players WHERE channelid=? AND guildid=?";
                try {
                    const count = await conn.query(countmembers, [interaction.channelId, interaction.guildId ? interaction.guildId : interaction.channelId]);
                    if (count[0]['COUNT(*)'] > 10n) {
                        interaction.reply({ content: `This game is already at 10 players!\n\nStart your own game in a different channel with /start.\n\n(Note that there can only be one game per channel.)`, ephemeral: true });
                        resolve()
                    }
                } catch (err) {
                    interaction.reply(`Error ${err}`);
                    resolve()
                }

                // else, add player
                let sql = "SELECT COUNT(*), gameid FROM games WHERE guildid=? AND channelid=?";
                const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
                if (game[0]['COUNT(*)'] !== 1n) {
                    interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
                    resolve()
                } else {
                    // add player!
                    let sql2 = "INSERT INTO players (gameid, channelid, guildid, playername, playeremoji, userid, points) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    await conn.query(sql2, [game[0]['gameid'], interaction.channelId, interaction.guildId, playername, playeremoji, interaction.user.id, 0]);
                    interaction.reply(`Player ${playername} - ${playeremoji} has joined the game!`);
                    resolve()
                }
            }
        })
        await prom.then(() => {
            closeConns(conns);
        })
    }
}