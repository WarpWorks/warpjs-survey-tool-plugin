module.exports = ($) => {
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        trigger: 'click'
    });
};
