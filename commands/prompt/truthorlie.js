const closeConns = require('../../utils/closeConns');
const openConns = require('../../utils/openConns');
const handleTruthOrLies = require('../../handlers/handleTLResponses');
const { responsetimer } = require('../../utils/vals.json');
const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');

module.exports = {
    name: 'truthorlie',
    description: 'Show rules for Truth or Lie.',
    integration_types: [0, 1],
    contexts: [0],
    type: ApplicationCommandOptionType.Subcommand,
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];

        const prom = new Promise(async (resolve) => {
            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid, timers, adult, system FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);

            let gameid = game[0]['gameid'];
            let timers = game[0]['timers'];

            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
                resolve()
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can start a prompt!`, flags: MessageFlags.Ephemeral });
                resolve()
            } else {

                // get the timer
                let currentStamp = Math.floor(new Date() / 1000);
                let timerStamp = currentStamp + responsetimer / 1000;
                let responsecountdown = `\n\nResponses close <t:${timerStamp}:R>!`;

                // show the prompt
                const botMessage = await interaction.reply({ content: `Let's play Two Truths and a Lie!\n\nUse the command \`/truthorlie\` to submit two truths and a lie!\n\n${timers === 1 ? responsecountdown : ""}`, withResponse: true });

                // set up a unique entry in database for this prompt to generate a qid; promptid=0 will always be truthorlie
                let recordquestion = "INSERT INTO gametracking (gameid, promptid) VALUES (?, ?)";
                await conn.query(recordquestion, [gameid, 0]);

                // get how many players there are
                let getPlayerCount = "SELECT COUNT(*) FROM players WHERE channelid=? AND guildid=?";
                let players = await conn.query(getPlayerCount, [interaction.channelId, interaction.guildId]);
                let playercount = Number(players[0]['COUNT(*)']);

                // set shit for whenever players have submitted responses and/or timer is up
                if (timers === 1) {
                    // run handler after responsetimer amount of time, multiplied by number of players
                    setTimeout(async () => {
                        await handleTruthOrLies(interaction, conn, gameid, timers, client);
                        resolve()
                    }, responsetimer);
                } else {
                    // get qid (do not put this unnecessarily in setinterval)
                    let qidquery = "SELECT qid FROM gametracking WHERE gameid=? AND promptid=? ORDER BY qid DESC LIMIT 1";
                    let qid = await conn.query(qidquery, [gameid, 0]); // remember, promptid=0 is always truthorlie
                    // use setInterval every 5 seconds to check how many responses there are. this may be inefficient. ugh
                    let repeater = setInterval(async () => {
                        let check = "SELECT COUNT(*) FROM responses WHERE gameid=? AND qid=?";
                        let result = await conn.query(check, [gameid, qid[0]['qid']]);
                        if (result[0]['COUNT(*)'] == playercount) {
                            clearInterval(repeater);
                            await handleTruthOrLies(interaction, conn, gameid, timers, client, 0);
                            resolve();
                        }
                    }, 5000);
                }

            }
        })

        await prom.finally(() => { console.log('closing TruthOrLie conns'); closeConns(conns) });
    }
}