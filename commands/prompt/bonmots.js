const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');
const hr = require('../../utils/handleResponses');
const capitalized = require('../../utils/capitalize');
const { madlibstimer } = require('../../utils/vals.json');

module.exports = {
    name: 'bonmots',
    description: 'Prompt a round of BonMots!',
    integration_types: [0, 1],
    contexts: [0],
    subcommand: true,
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];

        const prom = new Promise(async (resolve) => {
            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid, timers, adult, system FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);

            let gameid = game[0]['gameid'];
            let adultcontent = game[0]['adult'];
            let timers = game[0]['timers'];
            let sysquestions = game[0]['system'];

            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
                resolve()
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can start a prompt!`, ephemeral: true });
                resolve()
            } else {
                // MAIN COMMAND CODE
                // pick a prompt randomly, excluding prompts already logged in gametracking
                let promptquery = `SELECT promptid, prompt FROM prompts WHERE gamemode=2 AND NOT EXISTS (SELECT 1 FROM gametracking WHERE gametracking.promptid = prompts.promptid) ${sysquestions === 1 ? "" : "AND system=0"} ${adultcontent === 1 ? "" : "AND adult=0"} ORDER BY RAND() LIMIT 1`;
                const selectedprompt = await conn.query(promptquery);

                // pick random player for prompt
                let playerquery = "SELECT playername, playeremoji FROM players WHERE channelid=? AND guildid=? ORDER BY RAND()";
                const selectedplayer = await conn.query(playerquery, [interaction.channelId, interaction.guildId ? interaction.guildId : interaction.channelId]);
                if (selectedplayer.length === 0) {
                    interaction.reply(`No players have joined!`);
                    resolve()
                } else {
                    let playername = selectedplayer[0]['playername'];
                    const question = selectedprompt[0]['prompt'].replaceAll('@', capitalized(playername));

                    let timerLength = madlibstimer * selectedplayer.length;

                    // add promptid to gametracking to prevent repeats within the same game
                    // this will also generate a unique question ID (qid) from autoincrement
                    let recordquestion = "INSERT INTO gametracking (gameid, promptid) VALUES (?, ?)";
                    await conn.query(recordquestion, [gameid, selectedprompt[0]['promptid']]);

                    // get the timer
                    let currentStamp = Math.floor(new Date() / 1000);
                    let timerStamp = currentStamp + timerLength / 1000;
                    let responsecountdown = `\n\nResponses close <t:${timerStamp}:R>!`;

                    // show the prompt
                    const botmessage = await interaction.reply({ content: `${question}${timers === 1 ? responsecountdown : ""}\n\nUse the command \`/bonmots\` and write your answer!`, fetchReply: true });

                    if (timers === 1) {
                        // run scoring after madlibstimer amount of time, multiplied by number of players
                        setTimeout(async () => {
                            hr.handleResponses(interaction, conn, botmessage, question, gameid, timers, client);
                            resolve();
                        }, timerLength);
                    } else {
                        // get qid (do not put this unnecessarily in setinterval)
                        let qidquery = "SELECT qid FROM gametracking WHERE gameid=? AND promptid=?";
                        let qid = await conn.query(qidquery, [gameid, selectedprompt[0]['promptid']]);
                        // use setInterval every 5 seconds to check how many responses there are. this may be inefficient. ugh
                        let repeater = setInterval(async () => {
                            let check = "SELECT COUNT(*) FROM responses WHERE gameid=? AND qid=?";
                            let result = await conn.query(check, [gameid, qid[0]['qid']]);
                            if (result[0]['COUNT(*)'] == selectedplayer.length) {
                                hr.handleResponses(interaction, conn, botmessage, question, gameid, timers, client);
                                clearInterval(repeater);
                                resolve();
                                // does this need a return here if clearInterval is set above?
                                // return;
                            }
                        }, 5000);
                    }
                }
            }
        })

        await prom.then(() => { closeConns(conns) });
    }
}