// PLURALGAME Bot
// created by @neartsua on Discord.

// NOTE can we make a general response handler??? what if we use the qid or something to somehow back-identify which prompt was last issued?
// currently even the no-timers mode is set to a max of 15 minutes.

require('dotenv').config();
const eventHandler = require('./handlers/eventHandler');
const { Client, IntentsBitField, Partials } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
})


eventHandler(client); // see ./handlers/eventHandler

client.login(process.env.TOKEN);
