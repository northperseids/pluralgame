require('dotenv').config();
const mariadb = require('mariadb');

async function enterData(gamemode, array, adult, system) {
    // open pool conn
    const pool = mariadb.createPool({
        host: 'localhost',
        database: 'PluralGame',
        user: process.env.MDB_USER,
        password: process.env.MDB_PASS,
    });
    // establish connection
    let conn = await pool.getConnection();

    console.log('Entering...');

    // sql query
    let sql = "INSERT INTO prompts (gamemode, prompt, adult, system) VALUES (?, ?, ?, ?)";
    try {

        array.forEach((prom) => {
            conn.query(sql, [gamemode, prom, adult, system]);
        });

    } catch (err) {
        console.log(err);
    } finally {
        if (conn) conn.end();
    }
    console.log('Finished!');
}

const prompts = [
    "A freeway billboard ad that would make you veer toward the exit:",
    "The worst name for a home security company:",
    "A polite way to "
]

const adultprompts = [
    "The worst Vegas casino: ___ Palace",
    "The unsexiest thought you can have:",
    "An adult version of any classic video game:"
]

// gamemode, array, adult, system
enterData(2, prompts, 0, 0);