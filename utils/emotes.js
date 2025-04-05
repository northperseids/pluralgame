module.exports = (emote) => {
    return emote.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);
}