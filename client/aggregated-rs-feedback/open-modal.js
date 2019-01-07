const template = require('./modal.hbs');

module.exports = ($, element, res) => {
    if (res._embedded.feedbackQuestions) {
        const modal = window.WarpJS.modal($, res._embedded.feedbackQuestions[0].id, res._embedded.feedbackQuestions[0].name, [
            { label: 'Close' }
        ]);
        $('> .modal-dialog > .modal-content > .modal-body', modal).html(template({res: res}));

        modal.modal('show');
    }
};
