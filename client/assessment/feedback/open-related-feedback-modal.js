const _ = require('lodash');
const Promise = require('bluebird');

const storage = require('./../../storage');
const resultQuestionTemplate = require('./related-question-feedback-modal.hbs');
const resultTemplate = require('./related-feedback-modal.hbs');
const surveyTemplate = require('./survey-feedback-modal.hbs');
const questionTemplate = require('./question-feedback-modal.hbs');

const styleThumbRadio = () => {
    $('.thumbs-container input:radio').hide().each(function() {
        $(this).attr('data-radio-thumb', this.name);
        var label = $("label[for=" + '"' + this.id + '"' + "]").text();
        $('<a ' + (label !== '' ? 'title=" ' + label + ' "' : '') + ' data-radio-thumb="' + this.name + '" class="radio-thumb" href="#">' + '<span class="radio ' + $(this).data('direction') + ' ' + (this.checked ? ' radio-checked' : '') + '"></span></a>').insertAfter(this);
    });
};

module.exports = ($, questionId, answerName, answerNum, questionName, submitUrl, resultsetId, resultId, feedbackType, iterationName) => {
    let modalId = questionId;
    let modalTitle = 'Feedback on recommendation';
    if (feedbackType === 'result') {
        modalId = resultsetId;
    } else if (feedbackType === 'survey') {
        modalId = 'survey-modal';
        modalTitle = 'My feedback is based on:';
    } else if (feedbackType === 'question') {
        modalId = 'question' + questionId;
        modalTitle = 'Project Explore Feedback Form';
    }
    let assessment;
    const modal = window.WarpJS.modal($, modalId, modalTitle);
    if (feedbackType === 'result') {
        $('> .modal-dialog > .modal-content > .modal-body', modal).html(resultTemplate());
    } else if (feedbackType === 'resultQuestion') {
        $('> .modal-dialog > .modal-content > .modal-body', modal).html(resultQuestionTemplate({
            questionId,
            answerName,
            answerNum,
            questionName
        }));
    } else if (feedbackType === 'survey') {
        $('> .modal-dialog > .modal-content > .modal-body', modal).html(surveyTemplate());
    } else if (feedbackType === 'question') {
        $('> .modal-dialog > .modal-content > .modal-body', modal).html(questionTemplate({questionName: questionName}));
    }

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
    let existingFeedback = null;

    if (feedbackType === 'result') {
        existingFeedback = _.find(assessment.resultsetFeedback, (feedback) => {
            return feedback.resultsetId === resultsetId && feedback.resultId === resultId && feedback.feedbackType === 'result';
        });
    } else if (feedbackType === 'resultQuestion') {
        existingFeedback = _.find(assessment.resultsetFeedback, (feedback) => {
            return feedback.resultsetId === resultsetId && feedback.resultId === resultId && feedback.feedbackType === 'resultQuestion' && feedback.questionId === questionId;
        });
    } else if (feedbackType === 'survey') {
        existingFeedback = _.find(assessment.resultsetFeedback, (feedback) => {
            return feedback.feedbackType === 'survey';
        });
    } else if (feedbackType === 'question') {
        existingFeedback = _.find(assessment.resultsetFeedback, (feedback) => {
            return feedback.feedbackType === 'question' && feedback.questionId === questionId;
        });
    }

    if (existingFeedback) {
        $(modal).find("input[name='thumb-value'][value='" + existingFeedback.thumbValue + "'] + .radio-thumb").click();
        $(modal).find('#feedback-reason').val(existingFeedback.comment);
        $(modal).find("input[name='based-on'][value='" + existingFeedback.basedOn + "']").attr('checked', 'checked');
        $(modal).find("input[name='question-specific'][value='" + existingFeedback.questionSpecific + "']").attr('checked', 'checked');
    }

    $(modal).on('click', '.related-feedback-submit', function(event) {
        const data = {
            questionnaireId: storage.getCurrent($, 'surveyId'),
            questionId: questionId,
            resultsetId: resultsetId,
            resultId: resultId,
            thumbValue: $(modal).find("input[name='thumb-value']:checked").val(),
            basedOn: $(modal).find("input[name='based-on']:checked").val(),
            comment: $(modal).find('#feedback-reason').val(),
            feedbackId: existingFeedback ? existingFeedback.feedbackId : null,
            feedbackType: feedbackType,
            questionSpecific: $(modal).find("input[name='question-specific']:checked").val()
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
                    let foundFeedback;
                    if (feedbackType === 'result') {
                        foundFeedback = _.find(assessment.resultsetFeedback, {resultId: resultId, resultsetId: resultsetId, feedbackType: feedbackType});
                    } else if (feedbackType === 'resultQuestion') {
                        foundFeedback = _.find(assessment.resultsetFeedback, {resultId: resultId, resultsetId: resultsetId, questionId: questionId, feedbackType: feedbackType});
                    } else if (feedbackType === 'survey') {
                        foundFeedback = _.find(assessment.resultsetFeedback, {feedbackType: feedbackType});
                    } else if (feedbackType === 'question') {
                        foundFeedback = _.find(assessment.resultsetFeedback, {questionId: questionId, feedbackType: feedbackType});
                    }

                    if (foundFeedback) {
                        foundFeedback.comment = data.comment;
                        foundFeedback.thumbValue = data.thumbValue;
                        foundFeedback.basedOn = data.basedOn;
                        foundFeedback.questionSpecific = data.questionSpecific;
                    } else {
                        assessment.resultsetFeedback.push({
                            feedbackId: res.feedbackId,
                            questionId: questionId,
                            resultsetId: resultsetId,
                            resultId: resultId,
                            comment: data.comment,
                            thumbValue: data.thumbValue,
                            basedOn: data.basedOn,
                            feedbackType: feedbackType,
                            questionSpecific: data.questionSpecific
                        });
                    }

                    updateAssessment();

                    $(modal).modal('toggle');
                    let feedbackThumbButton = $(".related-question-feedback-button[data-warpjs-question-id='" + questionId + "']");

                    if (feedbackType === 'result') {
                        feedbackThumbButton = $(".result-feedback-button[data-warpjs-resultset-id='" + resultsetId + "']");
                    }

                    if (feedbackType === 'result' || feedbackType === 'resultQuestion') {
                        feedbackThumbButton.removeClass('thumbsup');
                        feedbackThumbButton.removeClass('thumbsdown');
                        feedbackThumbButton.addClass(data.thumbValue.toLowerCase());
                    }
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
