const path = require('path');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = {
    name: 'rules',
    description: 'Show rules for each game mode.',
    integration_types: [0, 1],
    contexts: [0],
    callback: async (client, interaction) => {
        const localCommands = getLocalCommands(path.join(__dirname, '.'));
        try {
            const commandObject = localCommands.find(cmd => cmd.name === interaction.options.getSubcommand());
            if (!commandObject) return;
            await commandObject.callback(client, interaction);
        } catch (error) {
            console.log(`Error rulesHandler ${error}`)
        }
    }
}