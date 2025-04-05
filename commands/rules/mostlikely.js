const { EmbedBuilder } = require('discord.js');
const { embedcolor } = require('../../utils/vals.json');

module.exports = {
    name: 'mostlikely',
    description: 'Show rules for Most Likely.',
    integration_types: [0, 1],
    contexts: [0],
    subcommand: true,
    callback: async (client, interaction) => {
        let embed = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('Most Likely')
            .setDescription(`- I'll show a prompt like 'Who is most likely to fall for an internet scam?'\n- I'll react to the message with each player's emoji.\n- Vote for who you think fits the prompt best!
                                          - Systems are allowed as many votes as they have players in the game. It's up to each system whether they want that to mean each system member votes individually, or pool the votes.
                                          - You can react to an emoji multiple times to stack votes in case multiple system members want to vote for the same player.\n- I'll tally the votes at the end of the round. The player with the most votes gets points!`);
        interaction.reply({ embeds: [embed] })
    }
}