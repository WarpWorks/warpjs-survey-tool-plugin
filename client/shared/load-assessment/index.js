const fileLoaded = require('./file-loaded');

module.exports = ($, placeholder) => {
    $('[data-survey-tool-action="load-json"]', placeholder).on('click', function() {
        const inputFile = $('<input type="file">');
        inputFile.on('change', function(event) {
            if (event && event.target && event.target.files && event.target.files.length) {
                const reader = new FileReader();
                reader.onload = (event) => fileLoaded($, placeholder, event.target.result);
                reader.readAsText(event.target.files[0]);
            }
        });

        inputFile.trigger('click');
    });
};
