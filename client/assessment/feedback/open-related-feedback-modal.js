const _ = require('lodash');
const Promise = require('bluebird');

const storage = require('./../../storage');
const template = require('./related-feedback-modal.hbs');

const styleThumbRadio = () => {
    $('.thumbs-container input:radio').hide().each(function() {
        $(this).attr('data-radio-thumb', this.name);
        var label = $("label[for=" + '"' + this.id + '"' + "]").text();
        $('<a ' + (label !== '' ? 'title=" ' + label + ' "' : '') + ' data-radio-thumb="' + this.name + '" class="radio-thumb" href="#">' + '<span class="radio ' + $(this).data('direction') + ' ' + (this.checked ? ' radio-checked' : '') + '"></span></a>').insertAfter(this);
    });
};

module.exports = ($, questionId, answerName, answerNum, questionName, submitUrl, resultsetId, resultId) => {
    let assessment;
    const modal = window.WarpJS.modal($, questionId, 'Feedback on recommendation');
    $('> .modal-dialog > .modal-content > .modal-body', modal).html(template({
        questionId,
        answerName,
        answerNum,
        questionName
    }));

    modal.modal('show');

    styleThumbRadio();

    $(modal).on('click', 'a.radio-thumb', function(event) {
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

    const getAssessment = () => {
        assessment = storage.getAssessment(storage.getCurrent($, 'surveyId'), storage.getCurrent($, 'assessmentId'));
    };
    const updateAssessment = () => {
        storage.updateAssessment(storage.getCurrent($, 'surveyId'), storage.getCurrent($, 'assessmentId'), assessment);
    };

    getAssessment();

    const existingFeedback = _.find(assessment.resultsetFeedback, (feedback) => {
        return feedback.resultsetId === resultsetId && feedback.resultId === resultId && feedback.questionId === questionId;
    });

    if (existingFeedback) {
        $(modal).find("input[name='thumb-value'][value='" + existingFeedback.thumbValue + "'] + .radio-thumb").click();
        $(modal).find('#feedback-reason').val(existingFeedback.comment);
    }

    $(modal).on('click', '.related-feedback-submit', function(event) {
        const data = {
            questionnaireId: storage.getCurrent($, 'surveyId'),
            questionId: questionId,
            resultsetId: resultsetId,
            resultId: resultId,
            thumbValue: $(modal).find("input[name='thumb-value']:checked").val(),
            comment: $(modal).find('#feedback-reason').val(),
            feedbackId: existingFeedback ? existingFeedback.feedbackId : null
        };

        // update database
        Promise.resolve()
            .then(() => window.WarpJS.toast.loading($, "Loading data...", "Loading"))
            .then((toastLoading) => Promise.resolve()
                .then(() => window.WarpJS.proxy.patch($, submitUrl, data))
                .then((res) => {
                    // update local storage
                    getAssessment();
                    if (!assessment.resultsetFeedback) {
                        assessment.resultsetFeedback = [];
                    }

                    const foundFeedback = _.find(assessment.resultsetFeedback, {resultId: resultId, resultsetId: resultsetId, questionId: questionId});
                    if (foundFeedback) {
                        foundFeedback.comment = data.comment;
                        foundFeedback.thumbValue = data.thumbValue;
                    } else {
                        assessment.resultsetFeedback.push({
                            feedbackId: res.feedbackId,
                            questionId: questionId,
                            resultsetId: resultsetId,
                            resultId: resultId,
                            comment: data.comment,
                            thumbValue: data.thumbValue
                        });
                    }

                    updateAssessment();

                    $(modal).modal('toggle');
                })
                .catch((err) => {
                    console.error("Error:", err);
                    window.WarpJS.toast.error($, err.message, "Error getting data");
                })
                .finally(() => window.WarpJS.toast.close($, toastLoading))
            )
        ;
    });

    $(modal).on('hidden.bs.modal', function() {
        $(modal).remove();
    });
};