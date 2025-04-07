const path = require('path')
const getCommands = require("../../utils/getCommands");

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getCommands();

    // let hasSubcommand;
    // try {
    //     hasSubcommand = interaction.options.getSubcommand();
    // } catch (error) {
    //     console.log('this is unnecessary')
    //     hasSubcommand = false;
    // }

    try {
        const commandObject = localCommands.find(cmd => cmd.name === interaction.commandName);
        if (!commandObject) return;
        await commandObject.callback(client, interaction);
    } catch (error) {
        console.log(`Error 1 ${error}`)
    }
};