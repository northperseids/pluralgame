const path = require('path');
const getAllFiles = require("./getAllFiles");
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = (exceptions = []) => {
    let commands = [];

    // get all FOLDERS of the commands folder
    const commandCategories = getAllFiles(path.join(__dirname, '..', 'commands'), true);

    // for each command folder
    for (const commandCategory of commandCategories) {
        // get the command file path
        const commandFiles = getAllFiles(commandCategory);
        // get the command file object of each command file
        for (const commandFile of commandFiles) {
            const commandObject = require(commandFile);
            if (commandObject.type !== ApplicationCommandOptionType.Subcommand) { // if the command is NOT a subcommand, pass it on
                commands.push(commandObject);
            }
        }
    }
    return commands;
}