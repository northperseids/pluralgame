async function truthorlie(interaction, conn, botmessage, gameid, playerid, timers) {
    return new Promise(async (resolve) => {
        // get responses for this question
        // get qid
        let qidquery = "SELECT qid FROM gametracking WHERE gameid=? ORDER BY qid DESC LIMIT 1";
        const qid = await conn.query(qidquery, [gameid]);
        // get responses for this specific question ID (qid)
        let responsesquery = "SELECT response, response2, playername FROM responses WHERE gameid=? AND qid=? AND playerid=?";
        const responses = await conn.query(responsesquery, [gameid, qid[0]['qid'], playerid]);

        // handle no responses
        if (responses.length === 0) {
            interaction.followUp(`Well, you all have to actually submit responses! (No winner this round!)`);
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
            entry.response2 = responses[i]['response2'];
            entry.emoji = countemojis[i];
            submissions.push(entry);
            responsestring = responsestring + `${countemojis[i]} - ${responses[i]['response']}\n`;
            await botmessage.react(countemojis[i]);
        }

        interaction.editReply(`First up is ${playername}!\n\nVote for which you think is the lie!\n\n${responsestring}`);

        // filter out bot's own reactions
        const filter = (reaction, user) => user.id !== client.user.id;
        const collector = botmessage.createReactionCollector({ filter, time: votetimer, dispose: true });

        let votes = [];

        collector.on('collect', async (reaction, user) => {
            // prevent a user from voting multiple times for the same entry
            // cap user votes
            let capVotes = false;
            let numPlayerQuery = "SELECT COUNT(*) FROM players WHERE gameid=? AND userid=?";
            const numPlayersResult = await conn.query(numPlayerQuery, [gameid, user.id]);
            let numPlayers = numPlayersResult[0]['COUNT(*)'];
            let votesCast = votes.filter((entry) => entry.voter === user.id);
            if (votesCast.length >= numPlayers) {
                capVotes = true;
                interaction.followUp({ content: `You've voted the max number of times for your system!`, ephemeral: true });
            }
            // otherwise, add voter data
            if (capVotes === false) {
                votes.push(reaction.emoji.name);
            }
            // remove reactions
            reaction.users.remove(user.id);
        });

        collector.on('end', collected => {
            // tally votes - players should get a point for each vote on their response, plus an extra point if they got the majority?
            submissions.forEach(submission => {
                votes.forEach(vote => {
                    if (submission.emoji === vote) {
                        submission.tally += 1;
                    }
                })
            });
            let winners = submissions.filter(entry => entry.tally === Math.max(...submissions.map(entry => entry.tally)));
            let responsestring = "";
            // if winner tallies are 0, nobody voted
            if (winners[0].tally === 0) {
                interaction.followUp(`Well, you've got to *vote,* you know! (No winner this round!)`);
                return;
            }
            // award points for winners based on playerid and gameid
            submissions.forEach(entry => {
                let s = "";
                if (entry.tally > 1) {
                    s = "s";
                }
                responsestring = responsestring + `'${entry.response}' with ${entry.tally} vote${s} (${capitalized(entry.playername)}'s!)\n`;
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
                winnerstring = winnerstring + `'${winner.response}' wins with ${winner.tally} vote${s}! (That's ${capitalized(winner.playername)}'s!)\n`;
            });
            interaction.followUp(`Let's see those results!\n${responsestring}\n\n${winnerstring}`);
        });
    })
}