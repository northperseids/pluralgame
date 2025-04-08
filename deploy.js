require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType} = require('discord.js');
const path = require('path');
const getAllFiles = require('./utils/getAllFiles');
const getCommands = require('./utils/getCommands');

// integration_types: [0,1] means. I have no idea. but it works
// contexts: [0] means only guilds; [1,2] means DMs; [0,1,2] means all

// the below dynamically gets commands from files.
let commands = [];
const commandCategories = getAllFiles(path.join(__dirname, 'commands'), true);
for (cmdCat of commandCategories) {
    const commandFiles = getAllFiles(cmdCat);
    for (const cmdFile of commandFiles) {
        const obj = require(cmdFile);
        if (obj.type === ApplicationCommandOptionType.Subcommand) { // skip this iteration if it's a subcommand.
            continue;
        } else { // if command is NOT a subcommand
            if (obj.hasSubcommands) { // and if command HAS subcommands
                let subcommandPaths = getAllFiles(path.join(cmdFile, '..'));
                let subCommands = [];
                for (const cmdPath of subcommandPaths) {
                    const cmdObj = require(cmdPath);
                    if (cmdObj.type === ApplicationCommandOptionType.Subcommand) {
                        subCommands.push(cmdObj);
                    }
                }
                obj.options = subCommands;
                commands.push(obj);
            } else {
                commands.push(obj);
            }
        }
    }
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

global()