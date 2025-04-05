require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType, SlashCommandBuilder } = require('discord.js');

// integration_types: [0,1] means. I have no idea. but it works
// contexts: [0] means only guilds; [1,2] means DMs; [0,1,2] means all

// if commands aren't appearing, check the correct function is being called at the bottom of the file!

const commands = [
    {
        name: 'about',
        description: 'About the bot and games!',
        integration_types: [0, 1],
        contexts: [0]
    },
    {
        name: 'start',
        description: 'Start a game in this channel!',
        integration_types: [0, 1],
        contexts: [0],
        options: [
            {
                name: 'timers',
                description: 'Enable or disable timers',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            },
            {
                name: 'adultcontent',
                description: 'Enable or disable adult content',
                type: ApplicationCommandOptionType.Boolean,
                required: true
            }
        ]
    },
    {
        name: 'add',
        description: 'Add a player to a game!',
        integration_types: [0, 1],
        contexts: [0],
        options: [
            {
                name: 'playername',
                description: 'Player Name (case insensitive)',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'playeremoji',
                description: 'Player Emoji (must be a standard Discord emoji - no custom ones, sorry!)',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'remove',
        description: 'Removes a player from the current game.',
        integration_types: [0, 1],
        contexts: [0],
        options: [
            {
                name: `player`,
                description: `Remove a single player your system has added.`,
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'playername',
                        description: 'Player Name (case insensitive)',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            },
            {
                name: `all`,
                description: `Remove all players your system has added.`,
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    },
    {
        name: "prompt",
        description: 'Cue a new prompt!',
        integration_types: [0, 1],
        contexts: [0],
        options: [
            {
                name: 'mostlikely',
                description: 'Start a round of Most Likely!',
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: 'bonmots',
                description: 'Start a round of BonMots!',
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: 'madlibs',
                description: 'Start a round of Madlibs!',
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: 'truthorlie',
                description: 'Start a round of Truth or Lie!',
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    },
    {
        name: `madlibs`,
        description: `Respond to Madlibs!`,
        integration_types: [0, 1],
        contexts: [0],
        options: [
            {
                name: 'player',
                description: "What's your playername?",
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'response',
                description: "What's your answer?",
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },{
        name: `bonmots`,
        description: `Respond to BonMots!`,
        integration_types: [0, 1],
        contexts: [0],
        options: [
            {
                name: 'player',
                description: "What's your playername?",
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'response',
                description: "What's your answer?",
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    // {
    //     name: 'truthorlie',
    //     description: 'Respond to Truth or Lie!',
    //     integration_types: [0, 1],
    //     contexts: [0],
    //     options: [
    //         {
    //             name: 'player',
    //             description: "What's your playername?",
    //             type: ApplicationCommandOptionType.String,
    //             required: true
    //         },
    //         {
    //             name: 'truth1',
    //             description: "What's your first truth?",
    //             type: ApplicationCommandOptionType.String,
    //             required: true
    //         },
    //         {
    //             name: 'truth2',
    //             description: "What's your second truth?",
    //             type: ApplicationCommandOptionType.String,
    //             required: true
    //         },
    //         {
    //             name: 'lie',
    //             description: "What's your lie?",
    //             type: ApplicationCommandOptionType.String,
    //             required: true
    //         }
    //     ]
    // },
    {
        name: 'end',
        description: 'Tally points and end this game!',
        integration_types: [0, 1],
        contexts: [0]
    },
    {
        name: 'closeall',
        description: 'End all games in this server.',
        integration_types: [0, 1],
        contexts: [0]
    },
    {
        name: 'settings',
        description: `Edit or view game configuration.`,
        integration_types: [0, 1],
        contexts: [1, 2],
        options: [
            {
                name: `timer`,
                description: `Enable or disable timers.`,
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'timertoggle',
                        description: 'true=enabled, false=disabled',
                        type: ApplicationCommandOptionType.Boolean,
                        required: true
                    }
                ]
            },
            {
                name: `accepting`,
                description: `Enable or disable accepting new players.`,
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'playertoggle',
                        description: 'true=enabled, false=disabled',
                        type: ApplicationCommandOptionType.Boolean,
                        required: true
                    }
                ]
            },
            {
                name: `adult`,
                description: `Enable or disable adult content.`,
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'adulttoggle',
                        description: 'true=enabled, false=disabled',
                        type: ApplicationCommandOptionType.Boolean,
                        required: true
                    }
                ]
            },
            {
                name: `viewsettings`,
                description: `View the current game settings.`,
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: `viewplayers`,
                description: `View the current players and points.`,
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: `resetprompts`,
                description: `Clear the prompt history to refresh the prompt queue.`,
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    },
    {
        name: 'rules',
        description: `View more detailed rules for each game mode.`,
        integration_types: [0, 1],
        contexts: [1, 2],
        options: [
            {
                name: `mostlikely`,
                description: `Show rules for Most Likely.`,
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: `bonmots`,
                description: `Show rules for Bon Mots.`,
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: `madlibs`,
                description: `Show rules for MadLibs.`,
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: `truthorlie`,
                description: `Show rules for Truth or Lie.`,
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    }
];

function north() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log('Registering commands...')
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            )
            console.log('Commands registered!')
        } catch (error) {
            console.log(error);
        }
    })();
}

function dan() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log('Registering commands...')
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID_2),
                { body: commands }
            )
            console.log('Commands registered!')
        } catch (error) {
            console.log(error);
        }
    })();
}

function n7guild() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log('Registering commands...')
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, '1113132422796693625'),
                { body: commands }
            )
            console.log('Commands registered!')
        } catch (error) {
            console.log(error);
        }
    })();
}

function global() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log('Registering commands...')
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            )
            console.log('Commands registered!')
        } catch (error) {
            console.log(error);
        }
    })();
}

function globalClear() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log('Registering commands...')
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [] }
            )
            console.log('Commands registered!')
        } catch (error) {
            console.log(error);
        }
    })();
}

dan()