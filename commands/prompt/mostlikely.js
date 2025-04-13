const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');
const { votetimer } = require('../../utils/vals.json');
const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');

module.exports = {
    name: 'mostlikely',
    description: 'Prompt a round of Most Likely!',
    integration_types: [0, 1],
    contexts: [0],
    subcommand: true,
    type: ApplicationCommandOptionType.Subcommand,
    callback: async (client, interaction) => {
        const conns = await openConns();
        let conn = conns[1];

        const prom = new Promise(async (resolve) => {
            let sql = "SELECT COUNT(*), gameid, timers, adult, system, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
                resolve()
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can start a prompt!`, flags: MessageFlags.Ephemeral });
                resolve()
            } else {

                let gameid = game[0]['gameid'];
                let adultcontent = game[0]['adult'];
                let timers = game[0]['timers'];
                let sysquestions = game[0]['system']

                let textstring = "";
                let players = [];

                let playerquery = "SELECT playeremoji, playerid, playername FROM players WHERE gameid=?";
                const playerlist = await conn.query(playerquery, [gameid]);
                if (playerlist.length === 0) {
                    interaction.reply(`No players have joined!`);
                    resolve()
                } else {
                    playerlist.forEach(entry => {
                        let player = {};
                        player.name = entry['playername'];
                        player.id = entry['playerid'];
                        player.emoji = entry['playeremoji'];
                        player.tally = 0;
                        players.push(player);
                        textstring = textstring + `${player.name} - ${player.emoji}\n`;
                    });

                    // pick a prompt randomly, excluding prompts already logged in gametracking and optionally excluding adult content
                    let promptquery = `SELECT promptid, prompt FROM prompts WHERE gamemode=1 AND NOT EXISTS (SELECT 1 FROM gametracking WHERE gametracking.promptid = prompts.promptid) ${sysquestions === 1 ? "" : "AND system=0"} ${adultcontent === 1 ? "" : "AND adult=0"} ORDER BY RAND() LIMIT 1`;
                    const selectedprompt = await conn.query(promptquery);
                    const question = selectedprompt[0]['prompt'];
                    // add promptid to gametracking to prevent repeats within the same game
                    let repeatquery = "INSERT INTO gametracking (gameid, promptid) VALUES (?, ?)";
                    await conn.query(repeatquery, [gameid, selectedprompt[0]['promptid']]);

                    // establish timer
                    let currentStamp = Math.floor(new Date() / 1000);
                    let timerStamp = currentStamp + votetimer / 1000;
                    let countdown = `\n\nVotes close <t:${timerStamp}:R>!`;

                    // make bot react to message with each of the players' emojis
                    const botreply = await interaction.reply({ content: `Who is most likely to ${question}?\n\n${textstring}${timers === 1 ? countdown : ""}`, withResponse: true });
                    const botmessage = botreply.resource.message;
                    
                    playerlist.forEach(entry => {
                        botmessage.react(`${entry['playeremoji']}`);
                    });
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
                        let numPlayerQuery = "SELECT COUNT(*) FROM players WHERE gameid=? AND userid=?";
                        const numPlayersResult = await conn.query(numPlayerQuery, [gameid, user.id]);
                        let numPlayers = numPlayersResult[0]['COUNT(*)'];
                        let votesCast = votes.filter((entry) => entry.voter === user.id);
                        if (votesCast.length >= numPlayers) {
                            capVotes = true;
                            interaction.followUp({ content: `You've voted the max number of times for your system!`, flags: MessageFlags.Ephemeral });
                        }
                        // otherwise, add voter data
                        if (capVotes === false) {
                            let obj = {};
                            obj.voter = user.id;
                            obj.emoji = reaction.emoji.name;
                            votes.push(obj);
                        }
                        // remove reactions so players can't see who voted for who
                        reaction.users.remove(user.id);
                        // if all players have voted and timers are disabled, end voting
                        if (votes.length === playerlist.length && timers === 0) {
                            collector.stop();
                        }
                    });

                    collector.on('end', collected => {
                        // tally votes
                        players.forEach(player => {
                            votes.forEach(vote => {
                                if (player.emoji === vote.emoji) {
                                    player.tally += 1;
                                }
                            });
                        });
                        // identify winners by tally
                        let winners = players.filter(player => player.tally === Math.max(...players.map(player => player.tally)));
                        let winnerstring = "";
                        // if winner tallies are 0, nobody voted
                        if (winners[0].tally === 0) {
                            interaction.followUp(`Well, you've got to *vote,* you know! (No winner this round!)`);
                            resolve()
                        } else {
                            // award points for winners based on playerid and gameid
                            winners.forEach(winner => {
                                sql = "UPDATE players SET points=points+? WHERE playerid=? AND gameid=?";
                                try {
                                    conn.query(sql, [winner.tally, winner.id, gameid]);
                                } catch (err) {
                                    console.log(err);
                                }
                                let s = "";
                                if (winner.tally > 1) {
                                    s = "s";
                                }
                                winnerstring = winnerstring + `**${winner.name}** with ${winner.tally} vote${s}!\n`
                            });
                            interaction.followUp(`Votes are in!\n\nVoted most likely to ${question}:\n\n` + winnerstring);
                            resolve()
                        }
                    })
                }
            }
        })

        await prom.then(() => { closeConns(conns) });
    }
}