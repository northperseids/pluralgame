const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'truthorlie',
    description: 'Show rules for Truth or Lie.',
    integration_types: [0, 1],
    contexts: [0],
    options: [
        {
            name: 'player',
            description: 'Player Name (case-sensitive!)',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'truth1',
            description: 'Truth 1',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'truth2',
            description: 'Truth 2',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'lie',
            description: 'Lie',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];

        const prom = new Promise(async (resolve) => {
            let playername = interaction.options.get('player').value;
            let truth1 = interaction.options.get('truth1').value;
            let truth2 = interaction.options.get('truth2').value;
            let lie = interaction.options.get('lie').value;

            // check for a game session in the current channel
            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
                resolve()
            } else {
                // MAIN COMMAND CODE
                // check if system is playing - this returns data on ALL players from that system
                let sysquery = "SELECT playername, playerid FROM players WHERE userid=? AND gameid=?";
                const sys = await conn.query(sysquery, [interaction.user.id, gameid]);
                // get the highest question id (qid) from gametracking for this specific game so each response will be associated with that qid
                let qidquery = "SELECT qid, acceptresponses FROM gametracking WHERE gameid=? ORDER BY qid DESC LIMIT 1";
                const qid = await conn.query(qidquery, [gameid]);

                // disallow submitting responses if there is no open question
                if (qid[0]['acceptresponses'] == 0) {
                    interaction.reply({ content: `There is no question currently accepting responses!`, ephemeral: true });
                    resolve()
                    return;
                }

                if (sys.length > 0) {
                    for (i = 0; i < sys.length; i++) {

                        // cap entries to one PER PLAYER PER QID IN GAME
                        let entryquery = "SELECT COUNT(*) FROM responses WHERE playername=? AND gameid=? AND qid=?";
                        let entryresults = await conn.query(entryquery, [playername, gameid, qid[0]['qid']]);
                        if (entryresults[0]['COUNT(*)'] >= 1) {
                            interaction.reply({ content: `Player ${playername} already gave a response!`, ephemeral: true });
                            resolve()
                            return;
                        }

                        if (sys[i]['playername'] === playername) {
                            // string together truths and lies using &&& as delimiter
                            let response = `${truth1}&&&${truth2}&&&${lie}`;
                            // store response in database
                            let responsequery = "INSERT INTO responses (qid, gameid, playerid, playername, response) VALUES (?, ?, ?, ?, ?)";
                            await conn.query(responsequery, [qid[0]['qid'], gameid, sys[i]['playerid'], sys[i]['playername'], response]);
                            interaction.reply({ content: `Player ${playername}'s response submitted!`, ephemeral: true });
                            resolve()
                            return;
                        }
                    }
                    // because the above returns if the player is playing, this only fires if playername is NOT found.
                    interaction.reply({ content: `Player ${playername} not found!`, ephemeral: true });
                    resolve()
                } else {
                    interaction.reply({ content: `You or your system are not playing in this game!`, ephemeral: true })
                    resolve()
                }
            }
        });

        await prom.then(() => { closeConns(conns) });
    }
}