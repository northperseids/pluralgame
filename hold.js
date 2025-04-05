// PLURALGAME Bot
// created by @neartsua on Discord.

// NOTE can we make a general response handler??? what if we use the qid or something to somehow back-identify which prompt was last issued?
// currently even the no-timers mode is set to a max of 15 minutes.

require('dotenv').config();
const funcs = require('./handleResponses.js');
const mariadb = require('mariadb');
const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Partials, ButtonStyle, ApplicationCommandOptionType, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
})

const emotes = (str) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);

const capitalized = (name) => name.charAt(0).toUpperCase() + name.slice(1);

const votetimer = 30000;
const madlibstimer = 30000;
const truthorlietimer = 100000;
const embedcolor = '#ff6852';
const countemojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

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


let pool;
let conn;

function closeConnection() {
    console.log("ending connection")
    pool.end()
    conn.end()
}

client.on('ready', () => {
    console.log(client.user.displayName + ' is ready!');
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand) {
        return;
    }

    // connect to db once and reuse connection
    // open pool
    pool = mariadb.createPool({
        host: 'localhost',
        idleTimeout: 900000, // timeout set to 15 minutes? set to 0 for no timeout
        //database: 'PluralGame', // desktop
        database: 'pluralgame', // server
        user: process.env.MDB_USER,
        password: process.env.MDB_PASS,
    });

    try {
        conn = await pool.getConnection();
        console.log('Connection successful!');
    } catch (e) {
        console.log(e)
        console.log('Connection error!');
    }

    if (interaction.commandName === 'about') {
        const abouttext = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('About')
            .setDescription(`Hello! My name is Thomas, and I'll be your game host for today.\n
                        All my games are specifically designed for plural systems (and anyone else with multiple entities who might want to play!) - but anyone can play if they want to!\n
                        I currently offer two games. Use the buttons below to find out more!`);

        const howtotext = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('How-To')
            .setDescription(`**To start a game, run the /start command.** This will open a game associated with the channel the command was run in. Only one game session per channel!\n
                            The player who ran the /start command is my **co-host**, and is in charge of choosing and initiating rounds.\n
                            **To join the game, use /add** and enter a name and an emoji for each system member participating. (In this game, system-members can play individually! You won't need to do a bunch of switching, though, so long as everyone can communicate with whoever's fronting well enough.)\n
                            During voting, a user-account will be allowed as many votes as they have system-members playing, but it's up to each whether that means each member gets to cast a vote individually, or if they want to pool their votes.\n
                            The game is set up so that if you have multiple system members who want to vote for the same thing, you can, for example, 'react' then 'unreact' then 'react' again, and that'll cast two votes. (Votes are still capped at the number of participants you have in the game, though, so you can't keep mashing the react button to get infinite votes!)\n
                            **I'm still under development, so go easy on me** - I might crash or glitch a lot right now, so please be patient!\n
                            *If you have any questions, suggestions, comments, or concerns, please contact @neartsua on discord!*`);

        const setuptext = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('Setup')
            .setDescription(`**Commands**
                            /start - start a game in the current channel
                            /close - end the current game
                            /add - add a player to the current game
                            /remove - remove a player from the current game
                            /prompt mostlikely - start a round of Most Likely
                            /prompt madlibs - start a round of MadLibs
                            /prompt bonmots - start a round of BonMots
                            /madlibs - respond to madlibs
                            /bonmots - respond to bonmots
                            /settings - edit configuration for the current game\n
                            **Configuration Options**
                            /settings timer - enable or disable timers
                            /settings adult - enable or disable adult content
                            /settings players - enable or disable accepting new players
                            /settings viewsettings - show the game's current settings and ID
                            /settings viewplayers - show the current players and points`);

        const gamemodetext = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('Game Modes')
            .setDescription(`**Most Likely**
                            In this game, I'll show a prompt like 'Who is most likely to fall for an internet scam?'
                            Your job is to vote for who you think fits the prompt best by reacting to the emojis!\n
                            **MadLibs**
                            In this game, I'll show a prompt like 'PLAYER's worst nightmare: "_!'
                            Your job is to use the /respond command to fill in the blank or answer the question!
                            Players will vote on which response they think is the best at the end of the round.`);

        let buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('about')
                    .setLabel('About')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('howto')
                    .setLabel('How To')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('setup')
                    .setLabel('Setup')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('gamemodes')
                    .setLabel('Game Modes')
                    .setStyle(ButtonStyle.Primary)
            )

        let response = await interaction.reply({
            embeds: [abouttext],
            components: [buttons]
        })

        const collector1 = response.createMessageComponentCollector({ time: 300000 })
        collector1.on('collect', async listen1 => {
            if (listen1.customId === 'about') {
                await listen1.deferUpdate();
                await listen1.editReply({ embeds: [abouttext], components: [buttons] })
            }
            if (listen1.customId === 'howto') {
                await listen1.deferUpdate();
                await listen1.editReply({ embeds: [howtotext], components: [buttons] })
            }
            if (listen1.customId === 'setup') {
                await listen1.deferUpdate();
                await listen1.editReply({ embeds: [setuptext], components: [buttons] })
            }
            if (listen1.customId === 'gamemodes') {
                await listen1.deferUpdate();
                await listen1.editReply({ embeds: [gamemodetext], components: [buttons] })
            }
        });
    } else if (interaction.commandName === 'start') {

        // see if game already exists in this channel
        let sql = "SELECT COUNT(*) FROM games WHERE guildid=? AND channelid=?";
        const rows = await conn.query(sql, [interaction.guildId, interaction.channelId]);
        if (rows[0]['COUNT(*)'] == 1) {
            interaction.reply(`Game is already open in this channel! Either close it or begin play.`);
        } else {
            let timersEnabled = interaction.options.get('timers').value === true ? 1 : 0;
            let adultEnabled = interaction.options.get('adultcontent').value === true ? 1 : 0;

            // start game
            let startGame = "INSERT INTO games (guildid, channelid, hostid, startdate, timers, adult, acceptplayers) VALUES (?, ?, ?, now(), ?, ?, ?)";
            try {
                await conn.query(startGame, [interaction.guildId, interaction.channelId, interaction.user.id, timersEnabled, adultEnabled, 1]);
                interaction.reply(`Game opened by ${interaction.user.username}!\n\nTimers: ${timersEnabled === 0 ? 'Disabled' : 'Enabled'}\nAdult content: ${adultEnabled === 0 ? 'Disabled' : 'Enabled'}\nAccepting Players: Enabled\n\nParticipants can now add players with /add.`);
            } catch (err) {
                interaction.reply(`Error ${err}`);
            }
        }
    } else if (interaction.commandName === 'end') {

        // sql query
        let sql = "SELECT hostid, gameid FROM games WHERE guildid=? AND channelid=?";

        const rows = await conn.query(sql, [interaction.guildId, interaction.channelId]);
        if (rows.length === 0) {
            interaction.reply(`No game open in this channel!`)
        } else if (rows[0]['hostid'] === interaction.user.id) {
            // Show winner(s)
            let playersquery = "SELECT playername, playeremoji, points FROM players WHERE gameid=?";
            const players = await conn.query(playersquery, [rows[0]['gameid']]);
            let playerstring = "";

            if (players.length > 0) {
                const winner = players.reduce(function (prev, current) {
                    return (prev && prev.points > current.points) ? prev : current
                });
                players.forEach(player => {
                    playerstring += `${capitalized(player['playername'])} - ${player['playeremoji']} - ${player['points']} points\n`;
                });
                interaction.reply(`**Players:**\n${playerstring}\nLooks like ${winner.playername} won! Congratulations!`);
            } else {
                interaction.reply(`No players in game. Game closed.`);
            }

            // then close game
            // delete game from games
            sql = "DELETE FROM games WHERE gameid=?";
            try {
                await conn.query(sql, [rows[0]['gameid']]);
            } catch (err) {
                interaction.reply(`Error closing game ${rows[0]['gameid']}.`)
            }
            // delete players
            sql = "DELETE FROM players WHERE gameid=?";
            try {
                await conn.query(sql, [rows[0]['gameid']]);
            } catch (err) {
                interaction.reply(`Error closing game ${rows[0]['gameid']}.`)
            }
            // clear gametracking
            sql = "DELETE FROM gametracking WHERE gameid=?";
            try {
                await conn.query(sql, [rows[0]['gameid']]);
            } catch (err) {
                interaction.reply(`Error closing game ${rows[0]['gameid']}.`)
            }
            // clear responses
            sql = "DELETE FROM responses WHERE gameid=?";
            try {
                await conn.query(sql, [rows[0]['gameid']]);
            } catch (err) {
                interaction.reply(`Error closing game ${rows[0]['gameid']}.`)
            }
        } else {
            interaction.reply({ content: `You aren't the host! The host is the only one who can close the game.`, ephemeral: true });
        }

    } else if (interaction.commandName === 'closeall') {

        // Note that this one uses conn.end(); in a number of try-catches because it is CLOSING/DELETING GAME

        if (interaction.member.permissions.has('Administrator')) {
            // close game
            // delete game from games
            sql = "DELETE FROM games WHERE guildid=?";
            try {
                await conn.query(sql, [interaction.guildId]);
            } catch (err) {
                interaction.reply(`Error closing game ${interaction.guildId}.`)
                // error needs to fully close connection ahead of time
                if (conn) {
                    closeConnection();
                }
                return;
            }

            // delete players
            sql = "DELETE FROM players WHERE guildid=?";
            try {
                await conn.query(sql, [interaction.guildId]);
            } catch (err) {
                interaction.reply(`Error closing game ${interaction.guildId}.`)
                // error needs to fully close connection ahead of time
                if (conn) {
                    closeConnection();
                }
                return;
            }

            // next two need game IDs, so get gameIDs for this guild
            let getGameID = "SELECT gameid FROM games WHERE guildid=?";
            let gameIDs = await conn.query(getGameID, [interaction.guildId]);

            // if no games open, say so
            if (gameIDs.length === 0) {
                interaction.reply(`No games open in this server.`);
                // error needs to fully close connection ahead of time
                if (conn) {
                    closeConnection();
                }
                return;
            }
            // clear gametracking
            sql = "DELETE FROM gametracking WHERE gameid=?";
            try {
                gameIDs.forEach(async game => {
                    console.log(game['gameid'])
                    await conn.query(sql, [game['gameid']]);
                });
            } catch (err) {
                interaction.reply(`Error closing game ${interaction.guildId}.`)
                // error needs to fully close connection ahead of time
                if (conn) {
                    closeConnection();
                }
                return;
            }
            // clear responses
            sql = "DELETE FROM responses WHERE gameid=?";

            try {
                gameIDs.forEach(async game => {
                    await conn.query(sql, [game['gameid']])
                });
                interaction.reply(`Games closed!`);
            } catch (err) {
                console.log(err)
                interaction.reply(`Error closing games.`)
                // error needs to fully close connection ahead of time
                if (conn) {
                    closeConnection();
                }
                return;
            }
        } else {
            interaction.reply({ content: `You have to be an admin to run this command!`, ephemeral: true });
        }

    } else if (interaction.commandName === 'add') {

        let playername = interaction.options.get('playername').value.toLowerCase();
        let playeremoji = emotes(interaction.options.get('playeremoji').value);

        if (!playeremoji || !playeremoji[0] || playeremoji.length > 1) {
            interaction.reply({ content: `Emoji needs to be a single valid emoji!`, ephemeral: true });
        } else {
            // reject if emoji or name already taken
            let emojis = "SELECT playeremoji, playername FROM players WHERE channelid=? AND guildid=?";
            try {
                const playeremojis = await conn.query(emojis, [interaction.channelId, interaction.guildId ? interaction.guildId : interaction.channelId]);
                for (i = 0; i < playeremojis.length; i++) {
                    if (playeremoji[0] === playeremojis[i]['playeremoji']) {
                        interaction.reply({ content: `Someone is already using the emoji ${playeremoji[0]}!`, ephemeral: true });
                    } else if (playeremojis[i]['playername'] === playername) {
                        interaction.reply({ content: `Someone is already using the name ${playername}!`, ephemeral: true });
                    }
                }
            } catch (err) {
                interaction.reply(`Error ${err}`);
                // error needs to fully close connection ahead of time
                if (conn) {
                    closeConnection();
                }
                return;
            }

            // reject if max players
            let countmembers = "SELECT COUNT(*) FROM players WHERE channelid=? AND guildid=?";
            try {
                const count = await conn.query(countmembers, [interaction.channelId, interaction.guildId ? interaction.guildId : interaction.channelId]);
                if (count[0]['COUNT(*)'] > 10n) {
                    interaction.reply({ content: `This game is already at 10 players!\n\nStart your own game in a different channel with /start.\n\n(Note that there can only be one game per channel.)`, ephemeral: true });
                    return;
                }
            } catch (err) {
                interaction.reply(`Error ${err}`);
                // error needs to fully close connection ahead of time
                if (conn) {

                    closeConnection();
                }
                return;
            }

            // add player
            let sql = "SELECT COUNT(*), gameid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
            } else {
                // add player!
                let sql2 = "INSERT INTO players (gameid, channelid, guildid, playername, playeremoji, userid, points) VALUES (?, ?, ?, ?, ?, ?, ?)";
                await conn.query(sql2, [game[0]['gameid'], interaction.channelId, interaction.guildId, playername, playeremoji, interaction.user.id, 0]);
                interaction.reply(`Player ${capitalized(playername)} - ${playeremoji} has joined the game!`);
            }
        }
    } else if (interaction.commandName === 'remove') {
        if (interaction.options.getSubcommand() === 'player') {

            let playername = interaction.options.get('playername').value;

            // remove player
            let sql = "SELECT COUNT(*), gameid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
            } else {
                // if host, allow remove
                let hostsql = "SELECT hostid FROM games WHERE gameid=?";
                const host = await conn.query(hostsql, [game[0]['gameid']]);
                // check if player exists associated with this user id
                let playersql = "SELECT COUNT(*), userid FROM players WHERE gameid=? AND playername=?";
                const player = await conn.query(playersql, [game[0]['gameid'], playername.toLowerCase()]);
                // if user is host and player exists OR player exists and user account is associated with player
                if (host[0]['hostid'] === interaction.user.id && player[0]['COUNT(*)'] == 1 || player[0]['COUNT(*)'] == 1 && player[0]['userid'] === interaction.user.id) {
                    // remove player
                    let sql2 = "DELETE FROM players WHERE gameid=? AND playername=?";
                    await conn.query(sql2, [game[0]['gameid'], playername]);
                    interaction.reply(`Player ${playername} removed from game!`);
                    return;
                } else {
                    if (host[0]['hostid'] === interaction.user.id) {
                        interaction.reply({ content: `Sorry, no player by name ${playername}.`, ephemeral: true })
                    } else {
                        interaction.reply({ content: `Sorry, no player by name ${playername} associated with this account.`, ephemeral: true })
                    }
                }
            }
        } else if (interaction.options.getSubcommand() === 'all') {

            // remove players
            let sql = "SELECT COUNT(*), gameid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
            } else {
                // check if player exists associated with this user id
                let playersql = "SELECT userid, playername FROM players WHERE gameid=?";
                const player = await conn.query(playersql, [game[0]['gameid']]);
                // if user is host and player exists OR player exists and user account is associated with player
                if (player.length > 0 && player[0]['userid'] === interaction.user.id) {
                    // remove players
                    let sql2 = "DELETE FROM players WHERE gameid=? AND userid=?";
                    await conn.query(sql2, [game[0]['gameid'], interaction.user.id]);
                    interaction.reply(`Players ${player.map((p) => capitalized(p['playername'])).join(', ')} removed from game!`);
                } else {
                    if (host[0]['hostid'] === interaction.user.id) {
                        interaction.reply({ content: `Sorry, no player by name ${playername}.`, ephemeral: true })
                    }
                }
            }
        }
    } else if (interaction.commandName === 'settings') {
        if (interaction.options.getSubcommand() === 'viewsettings') {

            // check for a game session in the current channel and whether or not the host is the one who issued the command

            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                let settingsquery = "SELECT timers, adult, acceptplayers FROM games WHERE gameid=?";
                const settings = await conn.query(settingsquery, [gameid]);
                interaction.reply(`**Current settings:**\nGameID: ${gameid}\nTimers: ${settings[0]['timers'] === 1 ? 'Enabled' : 'Disabled'}\nAdult content: ${settings[0]['adult'] === 1 ? 'Enabled' : 'Disabled'}\nAccepting new players: ${settings[0]['acceptplayers'] === 1 ? 'Enabled' : 'Disabled'}`);
            }
        } else if (interaction.options.getSubcommand() === 'viewplayers') {

            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                let playersquery = "SELECT playername, playeremoji, points FROM players WHERE gameid=?";
                const players = await conn.query(playersquery, [gameid]);
                let playerstring = "";
                players.forEach(player => {
                    playerstring += `${capitalized(player['playername'])} - ${player['playeremoji']} - ${player['points']} points\n`;
                });
                interaction.reply(`**Players:**\n${playerstring}`);
            }
        } else if (interaction.options.getSubcommand() === 'timer') {

            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                let configquery = "UPDATE games SET timers=? WHERE gameid=?";
                let toggle = 0;
                let bool = interaction.options.get('timertoggle').value;
                if (bool === true) {
                    toggle = 1;
                }
                await conn.query(configquery, [toggle, gameid]);
                interaction.reply(`Timers ${toggle === 1 ? 'enabled' : 'disabled'}.`)
            }
        } else if (interaction.options.getSubcommand() === 'adult') {

            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                let configquery = "UPDATE games SET adult=? WHERE gameid=?";
                let toggle = 0;
                let bool = interaction.options.get('adulttoggle').value;
                if (bool === true) {
                    toggle = 1;
                }
                await conn.query(configquery, [toggle, gameid]);
                interaction.reply(`Adult content ${toggle === 1 ? 'enabled' : 'disabled'}.`)
            }
        } else if (interaction.options.getSubcommand() === 'accepting') {

            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                let configquery = "UPDATE games SET acceptplayers=? WHERE gameid=?";
                let toggle = 0;
                let bool = interaction.options.get('playertoggle').value;
                if (bool === true) {
                    toggle = 1;
                }
                await conn.query(configquery, [toggle, gameid]);
                interaction.reply(`Accepting new players ${toggle === 1 ? 'enabled' : 'disabled'}.`)
            }
        } else if (interaction.options.getSubcommand() === 'resetprompts') {

            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                let configquery = "DELETE FROM gametracking WHERE gameid=?";
                await conn.query(configquery, [gameid]).then(() => {
                    interaction.reply(`Prompt history cleared!`);
                });
            }
        }
    } else if (interaction.commandName === 'rules') {
        if (interaction.options.getSubcommand() === 'mostlikely') {
            let embed = new EmbedBuilder()
                .setColor(embedcolor)
                .setTitle('Most Likely')
                .setDescription(`- I'll show a prompt like 'Who is most likely to fall for an internet scam?'\n- I'll react to the message with each player's emoji.\n- Vote for who you think fits the prompt best!
                                  - Systems are allowed as many votes as they have players in the game. It's up to each system whether they want that to mean each system member votes individually, or pool the votes.
                                  - You can react to an emoji multiple times to stack votes in case multiple system members want to vote for the same player.\n- I'll tally the votes at the end of the round. The player with the most votes gets points!`);
            interaction.reply({ embeds: [embed] })
        } else if (interaction.options.getSubcommand() === 'bonmots') {
            let embed = new EmbedBuilder()
                .setColor(embedcolor)
                .setTitle('Bon Mots')
                .setDescription(`- I'll show a prompt like 'It's all fun and games until "_!'\n- Use the \`/bonmots\` respond command to submit a response. Specify which player is submitting the response!\n- I'll show all the responses anonymous, then react to vote on your favorite!
                                  - Systems are allowed as many votes as they have players in the game. It's up to each system whether they want that to mean each system member votes individually, or pool the votes.
                                  - You can react to an emoji multiple times to stack votes in case multiple system members want to vote for the same response.\n- I'll tally the votes at the end of the round. The player with the response that gets the most votes gets points!`);
            interaction.reply({ embeds: [embed] })
        } else if (interaction.options.getSubcommand() === 'madlibs') {
            let embed = new EmbedBuilder()
                .setColor(embedcolor)
                .setTitle('Mad Libs')
                .setDescription(`- I'll show a prompt like 'PLAYER's worst nightmare: "_!'\n- Use the \`/madlibs respond\` command to submit a response. Specify which player is submitting the response!\n- I'll show all the responses anonymous, then react to vote on your favorite!
                                  - Systems are allowed as many votes as they have players in the game. It's up to each system whether they want that to mean each system member votes individually, or pool the votes.
                                  - You can react to an emoji multiple times to stack votes in case multiple system members want to vote for the same response.\n- I'll tally the votes at the end of the round. The player with the response that gets the most votes gets points!`);
            interaction.reply({ embeds: [embed] })
        }
    } else if (interaction.commandName === 'bonmots') {

        let playername = interaction.options.get('player').value.toLowerCase();
        let response = interaction.options.get('response').value;

        // check for a game session in the current channel
        let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
        const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
        let gameid = game[0]['gameid'];
        if (game[0]['COUNT(*)'] !== 1n) {
            interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
        } else {
            // MAIN COMMAND CODE
            // check if system is playing - this returns data on ALL players from that system
            let sysquery = "SELECT playername, playerid FROM players WHERE userid=? AND gameid=?";
            const sys = await conn.query(sysquery, [interaction.user.id, gameid]);
            // get the highest question id (qid) from gametracking for this specific game so each response will be associated with that qid
            let qidquery = "SELECT qid FROM gametracking WHERE gameid=? ORDER BY qid DESC LIMIT 1";
            const qid = await conn.query(qidquery, [gameid]);
            if (sys.length > 0) {
                for (i = 0; i < sys.length; i++) {

                    // cap entries to one PER PLAYER PER QID IN GAME
                    let entryquery = "SELECT COUNT(*) FROM responses WHERE playername=? AND gameid=? AND qid=?";
                    let entryresults = await conn.query(entryquery, [playername, gameid, qid[0]['qid']]);
                    if (entryresults[0]['COUNT(*)'] >= 1) {
                        interaction.reply({ content: `Player ${capitalized(playername)} already gave a response!`, ephemeral: true });
                        return;
                    }

                    if (sys[i]['playername'] === playername) {
                        // store response in database
                        let responsequery = "INSERT INTO responses (qid, gameid, playerid, playername, response) VALUES (?, ?, ?, ?, ?)";
                        await conn.query(responsequery, [qid[0]['qid'], gameid, sys[i]['playerid'], sys[i]['playername'], response]);
                        interaction.reply({ content: `Player ${capitalized(playername)}'s response submitted!`, ephemeral: true });
                        return;
                    }
                }
                // because the above returns if the player is playing, this only fires if playername is NOT found.
                interaction.reply({ content: `Player ${playername} not found!`, ephemeral: true });
            } else {
                interaction.reply({ content: `You or your system are not playing in this game!`, ephemeral: true })
            }
        }
    } else if (interaction.commandName === 'prompt') {
        if (interaction.options.getSubcommand() === 'madlibs') {

            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid, timers, adult, system FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);

            let gameid = game[0]['gameid'];
            let adultcontent = game[0]['adult'];
            let timers = game[0]['timers'];
            let sysquestions = game[0]['system'];

            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can start a prompt!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                // pick a prompt randomly, excluding prompts already logged in gametracking
                let promptquery = `SELECT promptid, prompt FROM prompts WHERE gamemode=3 AND NOT EXISTS (SELECT 1 FROM gametracking WHERE gametracking.promptid = prompts.promptid) ${sysquestions === 1 ? "" : "AND system=0"} ${adultcontent === 1 ? "" : "AND adult=0"} ORDER BY RAND() LIMIT 1`;
                const selectedprompt = await conn.query(promptquery);

                // pick random player for prompt
                let playerquery = "SELECT playername, playeremoji FROM players WHERE channelid=? AND guildid=? ORDER BY RAND()";
                const selectedplayer = await conn.query(playerquery, [interaction.channelId, interaction.guildId ? interaction.guildId : interaction.channelId]);
                if (selectedplayer.length === 0) {
                    interaction.reply(`No players have joined!`);
                } else {
                    let playername = selectedplayer[0]['playername'];
                    const question = selectedprompt[0]['prompt'].replaceAll('@', capitalized(playername));

                    // add promptid to gametracking to prevent repeats within the same game
                    // this will also generate a unique question ID (qid) from autoincrement
                    let recordquestion = "INSERT INTO gametracking (gameid, promptid) VALUES (?, ?)";
                    await conn.query(recordquestion, [gameid, selectedprompt[0]['promptid']]);

                    // get the timer
                    let currentStamp = Math.floor(new Date() / 1000);
                    let timerStamp = currentStamp + madlibstimer / 1000;
                    let responsecountdown = `\n\nResponses close <t:${timerStamp}:R>!`;

                    // show the prompt
                    const botmessage = await interaction.reply({ content: `${question}${timers === 1 ? responsecountdown : ""}\n\nUse the command \`/madlibs\` and write your answer!`, fetchReply: true });

                    if (timers === 1) {
                        // run scoring after madlibstimer amount of time, multiplied by number of players
                        setTimeout(async () => {
                            funcs.handleResponses(interaction, conn, botmessage, question, gameid, timers)
                        }, madlibstimer * selectedplayer.length);
                    } else {
                        // get qid (do not put this unnecessarily in setinterval)
                        let qidquery = "SELECT qid FROM gametracking WHERE gameid=? AND promptid=?";
                        let qid = await conn.query(qidquery, [gameid, selectedprompt[0]['promptid']]);
                        // use setInterval every 5 seconds to check how many responses there are. this may be inefficient. ugh
                        let repeater = setInterval(async () => {
                            let check = "SELECT COUNT(*) FROM responses WHERE gameid=? AND qid=?";
                            try {
                                let result = await conn.query(check, [gameid, qid[0]['qid']]);
                                if (result[0]['COUNT(*)'] == selectedplayer.length) {
                                    funcs.handleResponses(interaction, conn, botmessage, question, gameid, timers);
                                    clearInterval(repeater);
                                    return;
                                }
                            } catch {
                                botmessage.editReply(`${question}${timers === 1 ? responsecountdown : ""}\n\nUse the command \`/madlibs\` and write your answer!\n\nError! Something went wrong with the connection. Try another prompt!`);
                            }
                        }, 5000);
                    }
                }
            }
        } else if (interaction.options.getSubcommand() === 'truthorlie') {

            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can start a prompt!`, ephemeral: true });
            } else {
                // MAIN COMMAND CODE
                interaction.reply(`All right! Submissions are now OPEN for Truth or Lie.\n\nUse the command \`/truthorlie\` and follow the prompts!`)

                // add to gametracking to generate a qid for this question. promptid=0 because there is no true prompt.
                // this will also generate a unique question ID (qid) from autoincrement
                let recordquestion = "INSERT INTO gametracking (gameid, promptid) VALUES (?, ?)";
                await conn.query(recordquestion, [gameid, 0]);

                // run scoring after amount of time
                setTimeout(async () => {
                    // get responses for this question
                    // get qid
                    let qidquery = "SELECT qid FROM gametracking WHERE gameid=? ORDER BY qid DESC LIMIT 1";
                    const qid = await conn.query(qidquery, [gameid]);
                    // get responses for this specific question ID (qid)
                    let responsesquery = "SELECT response, response2, playername FROM responses WHERE gameid=? AND qid=?";
                    const responses = await conn.query(responsesquery, [gameid, qid[0]['qid']]);

                    // handle no responses
                    if (responses.length === 0) {
                        interaction.followUp(`Well, you have to actually submit responses! (No winner this round!)`);
                    } else {
                        // need to somehow sequence player truths and lies
                        //
                        //

                        // collectors for vote tallying
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
                            // remove reactions so players can't see who voted for what
                            reaction.users.remove(user.id);
                        });

                        collector.on('end', collected => {
                            // tally votes - players should get a point for each vote on their response
                            submissions.forEach(submission => {
                                votes.forEach(vote => {
                                    if (submission.emoji === vote) {
                                        submission.tally += 1;
                                    }
                                })
                            });
                            let winners = submissions.filter(entry => entry.tally === Math.max(...submissions.map(entry => entry.tally)));
                            let winnerstring = "";
                            // if winner tallies are 0, nobody voted
                            if (winners[0].tally === 0) {
                                interaction.followUp(`Well, you've got to *vote,* you know! (No winner this round!)`);
                            } else {
                                // award points for winners based on playerid and gameid
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
                                    winnerstring = winnerstring + `'${winner.response}' wins with ${winner.tally} vote${s}! (That was ${capitalized(winner.playername)}'s!)\n`;
                                });
                                if (winners.length > 1) {
                                    interaction.followUp(`Looks like there's a tie!\n\n` + winnerstring);
                                } else {
                                    interaction.followUp(winnerstring);
                                }
                            }
                        });
                    }

                }, truthorlietimer);

            }
        } else if (interaction.options.getSubcommand() === 'bonmots') {

            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid, timers, adult, system FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);

            let gameid = game[0]['gameid'];
            let adultcontent = game[0]['adult'];
            let timers = game[0]['timers'];
            let sysquestions = game[0]['system'];

            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can start a prompt!`, ephemeral: true });
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
                } else {
                    let playername = selectedplayer[0]['playername'];
                    const question = selectedprompt[0]['prompt'].replaceAll('@', capitalized(playername));

                    // add promptid to gametracking to prevent repeats within the same game
                    // this will also generate a unique question ID (qid) from autoincrement
                    let recordquestion = "INSERT INTO gametracking (gameid, promptid) VALUES (?, ?)";
                    await conn.query(recordquestion, [gameid, selectedprompt[0]['promptid']]);

                    // get the timer
                    let currentStamp = Math.floor(new Date() / 1000);
                    let timerStamp = currentStamp + madlibstimer / 1000;
                    let responsecountdown = `\n\nResponses close <t:${timerStamp}:R>!`;

                    // show the prompt
                    const botmessage = await interaction.reply({ content: `${question}${timers === 1 ? responsecountdown : ""}\n\nUse the command \`/bonmots\` and write your answer!`, fetchReply: true });

                    if (timers === 1) {
                        // run scoring after madlibstimer amount of time, multiplied by number of players
                        setTimeout(async () => {
                            funcs.handleResponses(interaction, conn, botmessage, question, gameid, timers)
                        }, madlibstimer * selectedplayer.length);
                    } else {
                        // get qid (do not put this unnecessarily in setinterval)
                        let qidquery = "SELECT qid FROM gametracking WHERE gameid=? AND promptid=?";
                        let qid = await conn.query(qidquery, [gameid, selectedprompt[0]['promptid']]);
                        // use setInterval every 5 seconds to check how many responses there are. this may be inefficient. ugh
                        let repeater = setInterval(async () => {
                            let check = "SELECT COUNT(*) FROM responses WHERE gameid=? AND qid=?";
                            let result = await conn.query(check, [gameid, qid[0]['qid']]);
                            if (result[0]['COUNT(*)'] == selectedplayer.length) {
                                funcs.handleResponses(interaction, conn, botmessage, question, gameid, timers);
                                clearInterval(repeater);
                                // does this need a return here if clearInterval is set above?
                                // return;
                            }
                        }, 5000);
                    }
                }
            }
        } else if (interaction.options.getSubcommand() === 'mostlikely') {

            let sql = "SELECT COUNT(*), gameid, timers, adult, system, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can start a prompt!`, ephemeral: true });
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

                    let msg = `Who is most likely to ${question}?\n\n${textstring}${timers === 1 ? countdown : ""}`;

                    // make bot react to message with each of the players' emojis
                    const botmessage = await interaction.reply({ content: msg, fetchReply: true });
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
                            interaction.followUp({ content: `You've voted the max number of times for your system!`, ephemeral: true });
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
                                winnerstring = winnerstring + `**${capitalized(winner.name)}** with ${winner.tally} vote${s}!\n`
                            });
                            interaction.followUp(`Votes are in!\n\nVoted most likely to ${question}:\n\n` + winnerstring);
                        }
                    })
                }
            }
        }
    } else if (interaction.commandName === 'truthorlie') {

        let playername = interaction.options.get('player').value.toLowerCase();
        let response = interaction.options.get('truth').value;
        let response2 = interaction.options.get('lie').value;

        // check for a game session in the current channel
        let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
        const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
        let gameid = game[0]['gameid'];
        if (game[0]['COUNT(*)'] !== 1n) {
            interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
        } else {
            // MAIN COMMAND CODE
            // check if system is playing - this returns data on ALL players from that system
            let sysquery = "SELECT playername, playerid FROM players WHERE userid=? AND gameid=?";
            const sys = await conn.query(sysquery, [interaction.user.id, gameid]);
            // get the highest question id (qid) from gametracking for this specific game so each response will be associated with that qid
            let qidquery = "SELECT qid FROM gametracking WHERE gameid=? ORDER BY qid DESC LIMIT 1";
            const qid = await conn.query(qidquery, [gameid]);
            if (sys.length > 0) {
                for (i = 0; i < sys.length; i++) {

                    // cap entries to one PER PLAYER PER QID IN GAME
                    let entryquery = "SELECT COUNT(*) FROM responses WHERE playername=? AND gameid=? AND qid=?";
                    let entryresults = await conn.query(entryquery, [playername, gameid, qid[0]['qid']]);
                    if (entryresults[0]['COUNT(*)'] >= 1) {
                        interaction.reply({ content: `Player ${capitalized(playername)} already gave a response!`, ephemeral: true });
                    } else {
                        if (sys[i]['playername'] === playername) {
                            // store response in database
                            let responsequery = "INSERT INTO responses (qid, gameid, playerid, playername, response, response2) VALUES (?, ?, ?, ?, ?, ?)";
                            await conn.query(responsequery, [qid[0]['qid'], gameid, sys[i]['playerid'], sys[i]['playername'], response, response2]);
                            interaction.reply({ content: `Player ${capitalized(playername)}'s response submitted!`, ephemeral: true });
                        }
                    }
                }
                // because the above returns if the player is playing, this only fires if playername is NOT found.
                interaction.reply({ content: `Player ${playername} not found!`, ephemeral: true });
            } else {
                interaction.reply({ content: `You or your system are not playing in this game!`, ephemeral: true })
            }
        }
    } else if (interaction.commandName === 'madlibs') {

        let playername = interaction.options.get('player').value.toLowerCase();
        let response = interaction.options.get('response').value;

        // check for a game session in the current channel
        let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
        const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
        let gameid = game[0]['gameid'];
        if (game[0]['COUNT(*)'] !== 1n) {
            interaction.reply(`No game found in this channel.\n\nStart a game with /start!`);
        } else {
            // MAIN COMMAND CODE
            // check if system is playing - this returns data on ALL players from that system
            let sysquery = "SELECT playername, playerid FROM players WHERE userid=? AND gameid=?";
            const sys = await conn.query(sysquery, [interaction.user.id, gameid]);
            // get the highest question id (qid) from gametracking for this specific game so each response will be associated with that qid
            let qidquery = "SELECT qid FROM gametracking WHERE gameid=? ORDER BY qid DESC LIMIT 1";
            const qid = await conn.query(qidquery, [gameid]);
            if (sys.length > 0) {
                for (i = 0; i < sys.length; i++) {

                    // cap entries to one PER PLAYER PER QID IN GAME
                    let entryquery = "SELECT COUNT(*) FROM responses WHERE playername=? AND gameid=? AND qid=?";
                    let entryresults = await conn.query(entryquery, [playername, gameid, qid[0]['qid']]);
                    if (entryresults[0]['COUNT(*)'] >= 1) {
                        interaction.reply({ content: `Player ${capitalized(playername)} already gave a response!`, ephemeral: true });
                        closeConnection();
                        return;
                    }

                    if (sys[i]['playername'] === playername) {
                        // store response in database
                        let responsequery = "INSERT INTO responses (qid, gameid, playerid, playername, response) VALUES (?, ?, ?, ?, ?)";
                        await conn.query(responsequery, [qid[0]['qid'], gameid, sys[i]['playerid'], sys[i]['playername'], response]);
                        interaction.reply({ content: `Player ${capitalized(playername)}'s response submitted!`, ephemeral: true });
                        closeConnection();
                        return;
                    }
                }
                // because the above returns if the player is playing, this only fires if playername is NOT found.
                interaction.reply({ content: `Player ${playername} not found!`, ephemeral: true });
            } else {
                interaction.reply({ content: `You or your system are not playing in this game!`, ephemeral: true })
            }
        }
    }

    setTimeout(closeConnection, 900000); // 900000 is 15 minutes

});

client.login(process.env.TOKEN);
