const { countemojis, votetimer } = require('../utils/vals.json');
const { MessageFlags } = require('discord.js');

module.exports = async function handleTruthOrLies(interaction, conn, gameid, timers, client, counter = 0) {
    let iteration = counter;
    // get responses for this question
    // get qid
    let qidquery = "SELECT qid FROM gametracking WHERE gameid=? ORDER BY qid DESC LIMIT 1";
    const qid = await conn.query(qidquery, [gameid]);
    // get responses for this specific question ID (qid)
    let responsesquery = "SELECT response, playername, playerid FROM responses WHERE gameid=? AND qid=?";
    let responses = await conn.query(responsesquery, [gameid, qid[0]['qid']]);
    let playercount = responses.length;

    const prom = new Promise(async (resolve) => {
        const chainedProm = new Promise(async (resolve) => {
            // handle no responses
            if (responses.length === 0) {
                interaction.followUp(`Well, you all have to actually submit responses! (Cue another prompt to play again.)`);
                resolve()
                return;
            } else {
                playercount = responses.length;
            }

            // Randomize the total response array - do we need to do this? Nobody knows the order in which responses were submitted anyway.
            // responses.sort(() => Math.random() - 0.5);

            let playerResponse = responses[counter].response.split('&&&');
            let lie = playerResponse[2];
            // randomize the individual player response array
            playerResponse.sort(() => Math.random() - 0.5);

            // responses blah
            let responseString = "";
            for (let i = 0; i < playerResponse.length; i++) {
                responseString = responseString + `${countemojis[i]} - ${playerResponse[i]}\n`;
            }

            let votecountdown;
            if (timers === 1) {
                // get timer again
                let currentStamp = Math.floor(new Date() / 1000);
                let voteStamp = currentStamp + votetimer / 1000;
                votecountdown = `\nVotes close <t:${voteStamp}:R>!`;
            }

            const botMessage = await interaction.followUp({ content: `Player ${responses[counter].playername} is up!\nVote for whichever you think is the lie!${timers === 1 ? votecountdown : ""}\n\n${responseString}`, withResponse: true });

            // bot react with each emoji and cache which emoji was the lie
            let lieEmoji;
            for (let i = 0; i < playerResponse.length; i++) {
                if (playerResponse[i] == lie) {
                    lieEmoji = countemojis[i];
                }
                await botMessage.react(countemojis[i]);
            }

            // filter out bot's own reactions
            const filter = (reaction, user) => user.id !== client.user.id;
            let collector;
            if (timers === 1) {
                collector = botMessage.createReactionCollector({ filter, time: votetimer, dispose: true });
            } else {
                collector = botMessage.createReactionCollector({ filter, dispose: true });
            }

            let votesOnLie = 0;
            let votes = [];

            // NOTE: LEFT OFF ROUGHLY HERE TRYING TO.ffffffucking. gestures vaguely at
            // the entirety of this fucking block. Yeah

            collector.on('collect', async (reaction, user) => {
                // cap user votes
                let capVotes = false;
                let numPlayerQuery = "SELECT userid FROM players WHERE gameid=?";
                const numPlayersResult = await conn.query(numPlayerQuery, [gameid]);
                let systemPlayers = numPlayersResult.filter((entry) => entry['userid'] === user.id);

                let votesCast = votes.filter((entry) => entry === user.id);
                if (votesCast.length >= systemPlayers.length) {
                    capVotes = true;
                    interaction.followUp({ content: `You've voted the max number of times for your system!`, flags: MessageFlags.Ephemeral });
                }

                // should we disallow voting for yourself? this would disallow system-wide voting for other players in the same system.

                // otherwise, tally votes and cache who's voted already
                if (capVotes === false) {
                    votes.push(user.id);
                    if (reaction.emoji.name === lieEmoji) {
                        votesOnLie += 1;
                    }
                }
                // remove reactions
                reaction.users.remove(user.id);
                // if timers disabled and all players voted, end voting
                if (votes.length == numPlayersResult.length && timers === 0) {
                    collector.stop();
                }
            });

            collector.on('end', async collected => {
                // need to note which was the lie
                interaction.followUp(`All right! Votes are in!\n\n${responses[counter].playername} fooled ${playercount - votesOnLie} of you - their lie was:\n- ${lie}\n\n`);
                // update points
                let pointsUpdate = "UPDATE players SET points=points+? WHERE playerid=?";
                await conn.query(pointsUpdate, [playercount - votesOnLie, responses[counter].playerid]);
                // close accepting questions
                let closeQuestion = "UPDATE gametracking SET acceptresponses=0 WHERE qid=?";
                await conn.query(closeQuestion, [qid[0]['qid']]);
                iteration = iteration + 1;
                resolve();
            });
        })

        await chainedProm;

        if (iteration < playercount) {
            await handleTruthOrLies(interaction, conn, gameid, timers, client, iteration);
        } else {
            interaction.followUp(`No more lies to sleuth out!\n\nPrompt another round with \`/truthorlie\` if you want to play again!`)
            resolve()
        }

    });

    await prom;
}