const { EmbedBuilder } = require('discord.js');
const { embedcolor } = require('../../utils/vals.json');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'truthorlie',
    description: 'Show rules for Truth or Lie.',
    integration_types: [0, 1],
    contexts: [0],
    type: ApplicationCommandOptionType.Subcommand,
    callback: async (client, interaction) => {
        let embed = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('Truth or Lie')
            .setDescription(`RULES`);
        interaction.reply({ embeds: [embed] })
    }
}