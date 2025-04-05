const path = require('path');
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
    // use the getAllFiles function from utils to get all event folders paths
    const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

    // for each path supplied in eventFolders above...
    for (const eventFolder of eventFolders) {
        // use getAllFiles to get all the .js files
        const eventFiles = getAllFiles(eventFolder);

        // get only the event name (which should be the .js file name)
        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop(); // replace all slashes with forward slashes if not linux; split; then grab last

        // use client.on listener
        client.on(eventName, async (arg) => {
            // for every .js event file, pull in the function and execute it (this only runs for "ready" and "interactionCreate" events)
            for (const eventFile of eventFiles) {
                const eventFunction = require(eventFile);
                await eventFunction(client, arg);
            }
        });
    };
};