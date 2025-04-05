const openConns = require('../../utils/openConns');
const closeConns = require('../../utils/closeConns');

module.exports = {
    name: 'viewsettings',
    description: 'View settings for the current game.',
    integration_types: [0, 1],
    contexts: [0],
    subcommand: true,
    callback: async (client, interaction) => {
        const conns = await openConns();

        const prom = new Promise(async (resolve) => {
            // check for a game session in the current channel and whether or not the host is the one who issued the command
            let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
            const game = await conns[1].query(sql, [interaction.guildId, interaction.channelId]);
            let gameid = game[0]['gameid'];
            if (game[0]['COUNT(*)'] !== 1n) {
                interaction.reply(`No game found in this channel.`);
                resolve();
            } else if (game[0]['hostid'] !== interaction.user.id) {
                interaction.reply({ content: `Only the host can use this command!`, ephemeral: true });
                resolve();
            } else {
                let settingsquery = "SELECT timers, adult, acceptplayers FROM games WHERE gameid=?";
                const settings = await conns[1].query(settingsquery, [gameid]);
                interaction.reply(`**Current settings:**\nGameID: ${gameid}\nTimers: ${settings[0]['timers'] === 1 ? 'Enabled' : 'Disabled'}\nAdult content: ${settings[0]['adult'] === 1 ? 'Enabled' : 'Disabled'}\nAccepting new players: ${settings[0]['acceptplayers'] === 1 ? 'Enabled' : 'Disabled'}`);
                resolve();
            }
        })

        await prom.then(() => { closeConns(conns) })
    }
}