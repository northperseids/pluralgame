const { EmbedBuilder } = require('discord.js');
const { embedcolor } = require('../../utils/vals.json');

module.exports = {
    name: 'bonmots',
    description: 'Show rules for Bon Mots.',
    integration_types: [0, 1],
    contexts: [0],
    subcommand: true,
    callback: async (client, interaction) => {
        let embed = new EmbedBuilder()
            .setColor(embedcolor)
            .setTitle('Bon Mots')
            .setDescription(`- I'll show a prompt like 'It's all fun and games until "_!'\n- Use the \`/bonmots\` respond command to submit a response. Specify which player is submitting the response!\n- I'll show all the responses anonymous, then react to vote on your favorite!
                                          - Systems are allowed as many votes as they have players in the game. It's up to each system whether they want that to mean each system member votes individually, or pool the votes.
                                          - You can react to an emoji multiple times to stack votes in case multiple system members want to vote for the same response.\n- I'll tally the votes at the end of the round. The player with the response that gets the most votes gets points!`);
        interaction.reply({ embeds: [embed] })
    }
}