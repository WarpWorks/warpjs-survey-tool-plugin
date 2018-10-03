module.exports = ($, key, value) => {
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.data(key, value);
};
