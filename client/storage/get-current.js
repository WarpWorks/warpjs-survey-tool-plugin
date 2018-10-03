module.exports = ($, key) => {
    const placeholder = $('#warpjs-content-placeholder');
    return placeholder.data(key);
};
