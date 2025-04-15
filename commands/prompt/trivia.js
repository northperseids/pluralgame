const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');
const handleResponses = require('../../handlers/handleTriviaResponses');
const { responsetimer } = require('../../utils/vals.json');
const unescape = require('../../utils/unescape');
const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');

module.exports = {
    name: 'trivia',
    description: 'Prompt a round of Trivia Clash!',
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
            let adultcontent = game[0]['adult'];
            let timers = game[0]['timers'];
            let sysquestions = game[0]['system'];

            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
                resolve()
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can start a prompt!`, flags: MessageFlags.Ephemeral });
                resolve()
            } else {
                // MAIN COMMAND CODE
                // pick a prompt randomly, excluding prompts already logged in gametracking
                // const categories = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 27, 29, 30, 31, 32];
                // const category = categories.sort((a, b) => 0.5 - Math.random())[0];
                // let promptquery = await fetch(`https://opentdb.com/api.php?amount=1&category=${category}&type=multiple`);
                // const selectedprompt = await promptquery.json();

                let promptquery = `SELECT promptid, prompt, answer FROM prompts WHERE gamemode=4 AND NOT EXISTS (SELECT 1 FROM gametracking WHERE gametracking.promptid = prompts.promptid) ${sysquestions === 1 ? "" : "AND system=0"} ${adultcontent === 1 ? "" : "AND adult=0"} ORDER BY RAND() LIMIT 1`;
                const selectedprompt = await conn.query(promptquery);

                const question = selectedprompt[0]['prompt'];
                const answer = selectedprompt[0]['answer'];

                let playerquery = "SELECT playername, playeremoji FROM players WHERE channelid=? AND guildid=? ORDER BY RAND()";
                const selectedplayer = await conn.query(playerquery, [interaction.channelId, interaction.guildId]);

                let timerLength = responsetimer * selectedplayer.length;

                // add promptid to gametracking to prevent repeats within the same game
                // -1 = trivia, 0 = truthorlie, anything above 0 = actual prompt from DB
                let recordquestion = "INSERT INTO gametracking (gameid, promptid) VALUES (?, ?)";
                await conn.query(recordquestion, [gameid, selectedprompt[0]['promptid']]);

                // get the timer
                let currentStamp = Math.floor(new Date() / 1000);
                let timerStamp = currentStamp + timerLength / 1000;
                let responsecountdown = `\n\nResponses close <t:${timerStamp}:R>!`;

                // show the prompt
                const botreply = await interaction.reply({ content: `${question}${timers === 1 ? responsecountdown : ""}\n\nUse the command \`/trivia\` and write your answer!`, withResponse: true });
                const botmessage = botreply.resource.message;

                if (timers === 1) {
                    // run scoring after responsetimer amount of time, multiplied by number of players
                    setTimeout(async () => {
                        await handleResponses(interaction, conn, botmessage, question, gameid, timers, client).then(() => {
                            resolve();
                        })
                    }, timerLength);
                } else {
                    // get qid (do not put this unnecessarily in setinterval)
                    let qidquery = "SELECT qid FROM gametracking WHERE gameid=? AND promptid=? ORDER BY qid DESC LIMIT 1";
                    let qid = await conn.query(qidquery, [gameid, selectedprompt[0]['promptid']]);
                    // use setInterval every 5 seconds to check how many responses there are. this may be inefficient. ugh
                    let repeater = setInterval(async () => {
                        let check = "SELECT COUNT(*) FROM responses WHERE gameid=? AND qid=?";
                        let result = await conn.query(check, [gameid, qid[0]['qid']]);
                        if (result[0]['COUNT(*)'] == selectedplayer.length) {
                            clearInterval(repeater);
                            await handleResponses(interaction, conn, botmessage, question, gameid, timers, client, answer).then(() => {
                                resolve();
                            });
                        }
                    }, 5000);
                }
            }
        })

        await prom.then(() => { console.log('closing Trivia conns'); closeConns(conns) });
    }
}