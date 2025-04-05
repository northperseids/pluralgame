const { EmbedBuilder } = require('discord.js');
const { embedcolor } = require('../../utils/vals.json');

module.exports = {
    name: 'truthorlie',
    description: 'Show rules for Truth or Lie.',
    integration_types: [0, 1],
    contexts: [0],
    subcommand: true,
    callback: async (client, interaction) => {
        let embed = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('Truth or Lie')
            .setDescription(`RULES`);
        interaction.reply({ embeds: [embed] })
    }
}