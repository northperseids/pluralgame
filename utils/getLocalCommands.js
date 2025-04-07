const getAllFiles = require("./getAllFiles");

module.exports = (directory, exceptions = []) => {
    let localCommands = [];

    // get all local command files
    const commandFiles = getAllFiles(directory, false);

    // for each command folder
    for (const commandFile of commandFiles) {
        const commandObject = require(commandFile);

        localCommands.push(commandObject);
    }

    return localCommands;
}