module.exports = ($, placeholder) => {
    placeholder.on('click', '.survey-tool-assessment-name', (event) => {
        const url = $(event.target).data('surveyToolUrl');
        if (url) {
            document.location.href = url;
        }
    });
};
