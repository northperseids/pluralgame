require('dotenv').config();
const openConns = require('./utils/openConns');
const closeConns = require('./utils/closeConns');

async function enterData(gamemode, array, adult, system) {
    const conns = openConns();
    let conn = conns[1];
    console.log('Entering...');

    // sql query
    let sql = "INSERT INTO prompts (gamemode, prompt, adult, system) VALUES (?, ?, ?, ?)";
    array.forEach((prom) => {
        conn.query(sql, [gamemode, prom, adult, system]);
    });
    console.log('Finished!');
    closeConns(conns);
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