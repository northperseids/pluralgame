// Command template

// open pool conn
const pool = mariadb.createPool({
    host: 'localhost',
    database: 'PluralGame',
    user: process.env.MDB_USER,
    password: process.env.MDB_PASS,
});
// establish connection
let conn = await pool.getConnection();

// check for a game session in the current channel and whether or not the host is the one who issued the command
try {
    let sql = "SELECT COUNT(*), gameid, hostid FROM games WHERE guildid=? AND channelid=?";
    const game = await conn.query(sql, [interaction.guildId, interaction.channelId]);
    let gameid = game[0]['gameid'];
    if (game[0]['COUNT(*)'] !== 1n) {
        interaction.reply(`No game found in this channel.\n\nStart a game with /play!`);
    } else if (game[0]['hostid'] !== interaction.user.id) {
        interaction.reply({ content: `Only the host can start a prompt!`, ephemeral: true });
    } else {
        // MAIN COMMAND CODE
    }
} catch (err) {
    interaction.reply(err);
} finally {
    if (conn) conn.end();
}

if (conn) conn.end();



// uppercase first letter of names
playername.charAt(0).toUpperCase()+playername.slice(1);