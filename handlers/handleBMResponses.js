const { countemojis, votetimer } = require('../utils/vals.json');

module.exports = async (interaction, conn, botmessage, question, gameid, timers, client) => {
    const prom = new Promise(async (resolve) => {
        // get responses for this question
        // get qid
        let qidquery = "SELECT qid FROM gametracking WHERE gameid=? ORDER BY qid DESC LIMIT 1";
        const qid = await conn.query(qidquery, [gameid]);
        // get responses for this specific question ID (qid)
        let responsesquery = "SELECT response, playername FROM responses WHERE gameid=? AND qid=?";
        const responses = await conn.query(responsesquery, [gameid, qid[0]['qid']]);

        // handle no responses
        if (responses.length === 0) {
            interaction.followUp(`Well, you all have to actually submit responses! (No winner this round!)`);
            resolve()
            return;
        }

        let submissions = [];

        // make bot react to message with a number for each entry, as well as caching player submissions associated with playerid
        let responsestring = "";
        for (i = 0; i < responses.length; i++) {
            let entry = {};
            entry.tally = 0;
            entry.playername = responses[i]['playername'];
            entry.response = responses[i]['response'];
            entry.emoji = countemojis[i];
            submissions.push(entry);
            responsestring = responsestring + `${countemojis[i]} - ${responses[i]['response']}\n`;
            await botmessage.react(countemojis[i]);
        }

        // get timer again
        let currentStamp = Math.floor(new Date() / 1000);
        let voteStamp = currentStamp + votetimer / 1000;
        let votecountdown = `\nVotes close <t:${voteStamp}:R>!`;

        interaction.editReply(`${question}\n\nResponses are in! Vote for your favorite!\n\n${responsestring}${timers === 1 ? votecountdown : ""}`);

        // filter out bot's own reactions
        const filter = (reaction, user) => user.id !== client.user.id;
        let collector;
        if (timers === 1) {
            collector = botmessage.createReactionCollector({ filter, time: votetimer, dispose: true });
        } else {
            collector = botmessage.createReactionCollector({ filter, dispose: true });
        }

        let votes = [];

        collector.on('collect', async (reaction, user) => {
            // cap user votes
            let capVotes = false;
            let numPlayerQuery = "SELECT userid FROM players WHERE gameid=?";
            const numPlayersResult = await conn.query(numPlayerQuery, [gameid]);
            let systemPlayers = numPlayersResult.filter((entry) => entry['userid'] === user.id);

            let votesCast = votes.filter((entry) => entry.voter === user.id);
            if (votesCast.length >= systemPlayers.length) {
                capVotes = true;
                interaction.followUp({ content: `You've voted the max number of times for your system!`, ephemeral: true });
            }
            // otherwise, add voter data
            if (capVotes === false) {
                let voter = {};
                voter.emoji = reaction.emoji.name;
                voter.voter = user.id;
                votes.push(voter);
            }
            // remove reactions
            reaction.users.remove(user.id);
            // if timers disabled and all players voted, end voting
            if (votes.length == numPlayersResult.length && timers === 0) {
                collector.stop();
            }
        });

        collector.on('end', async collected => {

            // tally votes - players should get a point for each vote on their response, plus an extra point if they got the majority?
            submissions.forEach(submission => {
                votes.forEach(vote => {
                    if (submission.emoji === vote.emoji) {
                        submission.tally += 1;
                    }
                })
            });
            let winners = submissions.filter(entry => entry.tally === Math.max(...submissions.map(entry => entry.tally)));
            let responsestring = "";
            let winnerstring = "";
            // if winner tallies are 0, nobody voted
            if (winners[0].tally === 0) {
                interaction.followUp(`Well, you've got to *vote,* you know! (No winner this round!)`);
                resolve()
                return;
            }
            // award points for winners based on playerid and gameid
            submissions.forEach(entry => {
                let s = "";
                if (entry.tally > 1 || entry.tally === 0) {
                    s = "s";
                }
                responsestring = responsestring + `- ${entry.response} *with ${entry.tally} vote${s} (${entry.playername}'s!)*\n`;
            });
            winners.forEach(winner => {
                sql = "UPDATE players SET points=points+? WHERE playername=? AND gameid=?";
                try {
                    conn.query(sql, [winner.tally, winner.playername, gameid]);
                } catch (err) {
                    console.log(err);
                }
                let s = "";
                if (winner.tally > 1) {
                    s = "s";
                }
                winnerstring = winnerstring + `"${winner.response}" wins with ${winner.tally} vote${s}! (That's ${winner.playername}'s!)\n`;
            });
            interaction.followUp(`Let's see those results!\n\n${question}\n\n${responsestring}\n${winnerstring}`);
            // close accepting questions
            let closeQuestion = "UPDATE gametracking SET acceptresponses=0 WHERE qid=?";
            await conn.query(closeQuestion, [qid[0]['qid']]);
            resolve()
        });
    });

    await prom;
}