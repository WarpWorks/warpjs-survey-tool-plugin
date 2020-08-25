module.exports = (key) => {
    if (key.startsWith('mm:')) {
        return key.slice(3).trim();
    } else if (key.startsWith('ipt:')) {
        return key.slice(4).trim();
    } else {
        return null;
    }
};
