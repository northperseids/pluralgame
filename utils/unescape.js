module.exports = (str) => {
    const one = str.replaceAll('&quot;', '"');
    return one.replaceAll('&#39;', "'");
}