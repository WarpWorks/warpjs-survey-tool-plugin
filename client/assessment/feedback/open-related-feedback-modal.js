const Promise = require('bluebird');

const template = require('./related-feedback-modal.hbs');

const styleThumbRadio = () => {
    $('.thumbs-container input:radio').hide().each(function() {
        $(this).attr('data-radio-thumb', this.name);
        var label = $("label[for=" + '"' + this.id + '"' + "]").text();
        $('<a ' + (label !== '' ? 'title=" ' + label + ' "' : '') + ' data-radio-thumb="' + this.name + '" class="radio-thumb" href="#">' + '<span class="radio ' + $(this).data('direction') + ' ' + (this.checked ? ' radio-checked' : '') + '"></span></a>').insertAfter(this);
    });
};

module.exports = ($, questionId, answerName, answerNum, questionName, submitUrl) => {
    const modal = window.WarpJS.modal($, questionId, 'Feedback on recommendation', [
        { label: 'Close' }
    ]);
    $('> .modal-dialog > .modal-content > .modal-body', modal).html(template({
        questionId,
        answerName,
        answerNum,
        questionName
    }));

    modal.modal('show');

    styleThumbRadio();

    $(document).on('click', 'a.radio-thumb', function(event) {
        event.preventDefault();
        const unique = $(this).attr('data-radio-thumb');
        const checked = $(this).find('span').hasClass('radio-checked');
        $("a[data-radio-thumb='" + unique + "'] span").removeClass('radio-checked');
        $(":radio[data-radio-thumb='" + unique + "']").attr('checked', false);
        if (!checked || !$('.questionnaire.question').length) {
            $(this).find('span').addClass('radio-checked');
            $(this).prev('input:radio').attr('checked', true);
        }
    });

    $(document).on('click', '.related-feedback-submit', function(event) {
        console.log('values::: ',
            questionId,
            answerName,
            answerNum,
            questionName, $("input[name='thumb-value']:checked").val(), $('#feedback-reason').val()
        );

        Promise.resolve()
            .then(() => window.WarpJS.toast.loading($, "Loading data...", "Loading"))
            .then((toastLoading) => Promise.resolve()
                .then(() => window.WarpJS.proxy.post($, submitUrl))
                .then((res) => console.log('got to here: ', res))
                .catch((err) => {
                    console.error("Error:", err);
                    window.WarpJS.toast.error($, err.message, "Error getting data");
                })
                .finally(() => window.WarpJS.toast.close($, toastLoading))
            )
        ;
    });
};
