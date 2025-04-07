const { connectionTimeout } = require('../utils/vals.json');

module.exports = (conns) => {
    setTimeout(() => {
        console.log("Ending connection.")
        conns[1].end()
        conns[0].end()
    }, connectionTimeout);
}