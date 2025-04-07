const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedcolor } = require('../../utils/vals.json');

module.exports = {
    name: 'about',
    description: 'About the bot and games!',
    integration_types: [0, 1],
    contexts: [0],
    callback: async (client, interaction) => {
        const abouttext = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('About')
            .setDescription(`Hello! My name is Thomas, and I'll be your game host.\n
                                All my games are specifically designed for plural systems (and anyone else with multiple entities who might want to play!) - but anyone can play if they want to!\n
                                I currently offer three games. Use the buttons below to find out more!`);

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
    }
}