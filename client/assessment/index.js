const _ = require('lodash');
const Promise = require('bluebird');
const uuid = require('uuid/v4');

const cannotFindAssessmentTemplate = require('./cannot-find-assessment.hbs');
const constants = require('./../constants');
const errorTemplate = require('./../error.hbs');
const getVersion = require('./get-version');
const mockWarpjsUtils = require('./../mock-warpjs-utils');
const openRelatedFeedbackModal = require('./feedback/open-related-feedback-modal.js');
const projectDescription = require('./project-description');
const Questionnaire = require('./../../lib/models/questionnaire');
const questionnaireTemplate = require('./questionnaire.hbs');
const questionnaireIntroTemplate = require('./questionnaire-intro.hbs');
const questionnaireLevelsTemplate = require('./questionnaire-levels.hbs');
const questionnaireIterationTemplate = require('./questionnaire-iterations.hbs');
const questionnaireSummaryTemplate = require('./results/questionnaire-summary.hbs');
const questionnaireDetailsTemplate = require('./results/questionnaire-details.hbs');
const questionnaireRelatedReadingTemplate = require('./results/questionnaire-related-readings.hbs');
const questionnaireRelatedDetailsTemplate = require('./results/questionnaire-related-reading-detail.hbs');
const questionnaireRelatedAllTemplate = require('./results/questionnaire-related-all.hbs');
const emailFormTemplate = require('./results/email-form-template.hbs');
const shared = require('./../shared');
const storage = require('./../storage');
const d3 = require('d3');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);
    $('.progress-container', placeholder).css('display', 'block');
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        trigger: 'click'
    });
    const styleRadio = () => {
        $('input:radio').hide().each(function() {
            $(this).attr('data-radio-fx', this.name);
            var label = $("label[for=" + '"' + this.id + '"' + "]").text();
            $('<a ' + (label !== '' ? 'title=" ' + label + ' "' : '') + ' data-radio-fx="' + this.name + '" class="radio-fx" href="#">' +
                '<span class="radio ' + (this.checked ? ' radio-checked' : '') + ' ' + $(this).attr("class") + '"></span></a>').insertAfter(this);
        });

        if ($(":radio.question-options[checked='checked']").length) {
            $('.questionnaire.question .question-next').html('Next Question');
        }

        $('a.radio-fx').on('click', function(event) {
            event.preventDefault();
            const unique = $(this).attr('data-radio-fx');
            const checked = $(this).find('span').hasClass('radio-checked');
            $("a[data-radio-fx='" + unique + "'] span").removeClass('radio-checked');
            $(":radio[data-radio-fx='" + unique + "']").attr('checked', false);
            if (!checked || !$('.questionnaire.question').length) {
                $(this).find('span').addClass('radio-checked');
                $(this).prev('input:radio').attr('checked', true);
            }
            if ($(":radio.question-options[data-radio-fx='" + unique + "'][checked='checked']").length) {
                $('.questionnaire.question .question-next').html('Next Question');
            } else if ($(this).hasClass('question-options')) {
                $('.questionnaire.question .question-next').html("Don't know (yet)");
            }
        });
    };

    return Promise.resolve()
        .then(() => window.WarpJS.getCurrentPageHAL($))
        .then((result) => {
            storage.setCurrent($, 'defaultAnswers', result.data._embedded.answers[0]);
            if (result.data && result.data._embedded && result.data._embedded.questionnaires) {
                storage.setCurrent($, 'surveyToolQuestionnaires', result.data._embedded.questionnaires.reduce(
                    (cumulator, questionnaire) => {
                        cumulator[questionnaire.id] = Questionnaire.fromHal(questionnaire);
                        return cumulator;
                    },
                    {}
                ));
            }

            const isMM = result.data._embedded.questionnaires[0].key === 'mm';

            if (result.error) {
                shared.setSurveyContent($, placeholder, errorTemplate(result.data));
            } else {
                shared.postRender($, result.data);

                let categoryPointer = 0;
                let iterationPointer = 0;
                let questionPointer = 0;
                let progress = 0;
                let assessment;

                if (result.data.assessmentId) {
                    assessment = storage.getAssessment(result.data.surveyId, result.data.assessmentId);
                    if (assessment) {
                        questionPointer = 2;
                        storage.setCurrent($, 'surveyId', result.data.surveyId);
                        storage.setCurrent($, 'assessmentId', result.data.assessmentId);
                    } else {
                        shared.setSurveyContent($, placeholder, cannotFindAssessmentTemplate({ assessmentId: result.data.assessmentId }));
                        return;
                    }
                } else {
                    storage.setCurrent($, 'surveyId', result.data.surveyId);
                    const questionnaire = storage.getCurrent($, 'surveyToolQuestionnaires')[storage.getCurrent($, 'surveyId')];
                    assessment = questionnaire.generateDefaultAssessment(uuid, 'foobar').toHal(mockWarpjsUtils).toJSON();
                    assessment.answers = assessment._embedded.answers;
                    delete assessment._embedded.answers;
                }

                let categories = [];
                let iterations = [];
                let questions = [];

                const calculatePriority = (priorityValue) => {
                    return isNaN(parseInt(priorityValue, 10)) ? 2 : parseInt(priorityValue, 10);
                };

                const filterContent = () => {
                    categories = _.filter(assessment.answers[0]._embedded.categories, (progressCategory) => {
                        const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                            console.log('progressQuestion.detailLevel === assessment.detailLevel', progressQuestion.detailLevel, typeof progressQuestion.detailLevel, assessment.detailLevel, typeof assessment.detailLevel);
                            return isMM ? parseInt(progressQuestion.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : progressQuestion.detailLevel <= assessment.detailLevel;
                        });
                        return questionDetailLevels.length > 0;
                    });
                    iterations = categories && categories[categoryPointer] ? _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                        return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                    }) : [];
                    questions = iterations.length > 0 ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                        return isMM ? parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : question.detailLevel <= assessment.detailLevel;
                    }) : [];
                };

                filterContent();
                progress = 1 / categories.length * 100;

                const getAssessment = () => {
                    assessment = storage.getAssessment(storage.getCurrent($, 'surveyId'), storage.getCurrent($, 'assessmentId'));
                    filterContent();
                };

                const updateAssessment = () => {
                    storage.updateAssessment(storage.getCurrent($, 'surveyId'), storage.getCurrent($, 'assessmentId'), assessment);
                };

                let progressFilteredCategories = [];

                const updateProgressTotal = () => {
                    progressFilteredCategories = _.cloneDeep(categories);
                    progressFilteredCategories.push('results');
                };
                updateProgressTotal();

                if (result.error) {
                    placeholder.html(errorTemplate(result.data));
                } else {
                    return Promise.resolve()
                        .then(() => {
                            const assignDetailLevelSelected = () => {
                                const detailLevel = assessment.detailLevel !== '' ? assessment.detailLevel : 2;
                                $("input[name='questionnaire-level'][value='" + detailLevel + "']").attr('checked', 'checked');
                            };

                            const feedbackUrl = result.data._links.submitFeedback.href;

                            $('.ipt-title').html(assessment.projectName);
                            const version = getVersion(assessment);
                            $('.ipt-version').html(version);

                            const levelsOnLeave = () => {
                                getAssessment();
                                assessment.detailLevel = $("input[name='questionnaire-level'][checked='checked']").val();
                                categories = _.filter(assessment.answers[0]._embedded.categories, (progressCategory) => {
                                    const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                                        return isMM ? parseInt(progressQuestion.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : progressQuestion.detailLevel <= assessment.detailLevel;
                                    });
                                    return questionDetailLevels.length > 0;
                                });
                                updateProgressTotal();
                                updateAssessment();
                            };

                            $(document).on('click', '.description-back, .description-next', (event) => {
                                const direction = $(event.target).hasClass('description-back') ? 'back' : 'next';
                                if ($('#project-name').val() || $(event.target).hasClass('description-back')) {
                                    if (result.data.assessmentId) {
                                        getAssessment();
                                    }
                                    assessment.projectName = $('#project-name').val();
                                    assessment.mainContact = $('#main-contact').val();
                                    assessment.projectStatus = $('#project-status').val();
                                    updateQuestions();
                                    updatePointers(direction);
                                    updateAssessment();

                                    $('.ipt-title').html(assessment.projectName);
                                    const version = getVersion(assessment);
                                    $('.ipt-version').html(version);
                                } else {
                                    $('#project-name').addClass('is-invalid');
                                    $('.invalid-feedback').css('display', 'block');
                                }
                            });

                            $(document).on('click', '.levels-back, .levels-next', () => {
                                levelsOnLeave();
                            });

                            const updatePointers = (direction) => {
                                categories = _.filter(categories, (progressCategory) => {
                                    const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                                        return isMM ? parseInt(progressQuestion.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : progressQuestion.detailLevel <= assessment.detailLevel;
                                    });
                                    return questionDetailLevels.length > 0;
                                });
                                iterations = categories[categoryPointer] ? _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                    return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                }) : [];
                                questions = iterations.length ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                    return isMM ? parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : question.detailLevel <= assessment.detailLevel;
                                }) : [];
                                let outOfBounds = '';
                                if (direction === 'next') {
                                    if (questionPointer + 1 >= questions.length) {
                                        if (iterationPointer + 1 >= iterations.length) {
                                            if (categoryPointer + 1 >= categories.length) {
                                                outOfBounds = 'end';
                                            } else {
                                                categoryPointer += 1;
                                                iterationPointer = 0;
                                                questionPointer = 0;

                                                iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                                    return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                                });

                                                questions = iterations.length > 0 ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                                    return isMM ? parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : question.detailLevel <= assessment.detailLevel;
                                                }) : [];
                                                if (categories[categoryPointer].isRepeatable) {
                                                    questionPointer = -1;
                                                }
                                            }
                                        } else {
                                            iterationPointer += 1;
                                            questionPointer = 0;

                                            questions = _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                                return isMM ? parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : question.detailLevel <= assessment.detailLevel;
                                            });
                                        }
                                    } else {
                                        questionPointer += 1;
                                    }
                                } else if (direction === 'back') {
                                    if ((categories[categoryPointer].isRepeatable && iterationPointer === 0 && questionPointer - 1 < -1) || (categories[categoryPointer].isRepeatable && iterationPointer > 0 && questionPointer - 1 < 0) || (!categories[categoryPointer].isRepeatable && questionPointer - 1 < 0)) {
                                        if (iterationPointer - 1 < 0) {
                                            if (categoryPointer - 1 < 0) {
                                                outOfBounds = 'front';
                                            } else {
                                                categoryPointer -= 1;
                                                iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                                    return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                                });
                                                questions = iterations.length ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                                    return isMM ? parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : question.detailLevel <= assessment.detailLevel;
                                                }) : [];
                                                iterationPointer = iterations.length === 0 ? 0 : iterations.length - 1;
                                                questionPointer = questions.length - 1;
                                            }
                                        } else {
                                            iterationPointer -= 1;
                                            questionPointer = questions.length - 1;
                                        }
                                    } else {
                                        questionPointer -= 1;
                                    }
                                }

                                updateQuestionContent(outOfBounds);
                            };

                            const assignOptionSelected = (qQuestion, aQuestion) => {
                                if (typeof qQuestion !== 'undefined' && typeof aQuestion !== 'undefined') {
                                    let option = _.find(qQuestion._embedded.options, (option) => {
                                        return option.id === aQuestion.answer;
                                    });
                                    if (typeof option !== 'undefined') {
                                        option.isSelected = true;
                                    }
                                }
                                return qQuestion;
                            };

                            const templateValues = () => {
                                const currentCategory = categories[categoryPointer] ? _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                    return category.id === categories[categoryPointer].id;
                                }) : null;
                                currentCategory.comments = categories[categoryPointer].comments;
                                const currentQuestion = questions[questionPointer] ? _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                    return question.id === questions[questionPointer].id;
                                })) : null;
                                const updatedQuestion = assignOptionSelected(currentQuestion, questions[questionPointer]);
                                if (updatedQuestion) {
                                    updatedQuestion.comments = questions[questionPointer].comments;
                                    updatedQuestion.priority = questions[questionPointer].priority;
                                }
                                let values = {category: currentCategory, question: updatedQuestion};
                                if (iterations[iterationPointer] && iterations[iterationPointer].name !== '') {
                                    values.iteration = iterations[iterationPointer];
                                }

                                if (currentQuestion && currentQuestion.imageUrl) {
                                    values.image = currentQuestion.imageUrl;
                                } else if (currentCategory && currentCategory.imageUrl) {
                                    values.image = currentCategory.imageUrl;
                                }

                                let currentImageLibrary = null;
                                let imageArea = null;
                                if (currentQuestion && currentQuestion.imgLibId && currentQuestion.imageArea) {
                                    currentImageLibrary = currentQuestion.imgLibId;
                                    imageArea = currentQuestion.imageArea;
                                } else if (currentQuestion && currentQuestion.imgLibId) {

                                } else if (currentQuestion && currentQuestion.imageArea) {
                                    currentImageLibrary = currentCategory.imgLibId;
                                    imageArea = currentQuestion.imageArea;
                                } else {
                                    currentImageLibrary = currentCategory.imgLibId;
                                    imageArea = currentCategory.imageArea;
                                }

                                const currentImglib = _.find(result.data._embedded.questionnaires[0]._embedded.imageLibraries, (imageLibrary) => {
                                    return imageLibrary.id === currentImageLibrary;
                                });

                                const currentImageArea = imageArea ? _.find(currentImglib && currentImglib._embedded.images ? currentImglib._embedded.images[0]._embedded.imageMaps : null, (imageMap) => {
                                    return imageMap && imageMap.title === imageArea;
                                }) : null;
                                const currentImageHeight = currentImglib && currentImglib._embedded.images ? currentImglib._embedded.images[0].height : null;
                                const currentImageWidth = currentImglib && currentImglib._embedded.images ? currentImglib._embedded.images[0].width : null;
                                values.imageMap = currentImageArea ? currentImageArea.coords : null;
                                values.imageHeight = currentImageHeight;
                                values.imageWidth = currentImageWidth;
                                if (values.question) {
                                    const priority = calculatePriority(values.question.priority);
                                    values.priorityHigh = priority === 3;
                                    values.priorityMid = priority === 2;
                                    values.priorityLow = priority === 1;
                                    values.showPriority = values.question._embedded.options.length && !isNaN(parseInt(assessment.detailLevel, 10)) && parseInt(assessment.detailLevel, 10) > 1;
                                }

                                return values;
                            };

                            const introTemplateValues = () => {
                                const currentCategory = categories[categoryPointer] ? _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                    return category.id === categories[categoryPointer].id;
                                }) : null;
                                const currentQuestion = questions[questionPointer] ? _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                    return question.id === questions[questionPointer].id;
                                })) : null;
                                let values = {category: currentCategory, question: currentQuestion};
                                if (questionPointer) {
                                    values.notFirst = true;
                                }

                                if (currentQuestion && currentQuestion.imageUrl) {
                                    values.image = currentQuestion.imageUrl;
                                }

                                return values;
                            };

                            const createImageMapElements = (imageMapValues) => {
                                const imageMapCoords = imageMapValues.split(',');
                                const topLeft = document.createElement('div');
                                $(topLeft).addClass('image-map-overlay top-left')
                                    .css({
                                        left: '0px',
                                        top: '0px',
                                        width: imageMapCoords[0] + 'px',
                                        height: imageMapCoords[1] + 'px'
                                    })
                                    .appendTo($('.image-map-img-container'));

                                const topMid = document.createElement('div');
                                $(topMid).addClass('image-map-overlay top-mid')
                                    .css({
                                        left: imageMapCoords[0] + 'px',
                                        top: '0px',
                                        width: (imageMapCoords[2] - imageMapCoords[0]) + 'px',
                                        height: imageMapCoords[1] + 'px'
                                    })
                                    .appendTo($('.image-map-img-container'));

                                const topRight = document.createElement('div');
                                $(topRight).addClass('image-map-overlay top-right')
                                    .css({
                                        left: imageMapCoords[2] + 'px',
                                        top: '0px',
                                        width: 'calc(100% - ' + imageMapCoords[2] + 'px)',
                                        height: imageMapCoords[1] + 'px'
                                    })
                                    .appendTo($('.image-map-img-container'));

                                const midRight = document.createElement('div');
                                $(midRight).addClass('image-map-overlay mid-right')
                                    .css({
                                        left: imageMapCoords[2] + 'px',
                                        top: imageMapCoords[1] + 'px',
                                        width: 'calc(100% - ' + imageMapCoords[2] + 'px)',
                                        height: (imageMapCoords[3] - imageMapCoords[1]) + 'px'
                                    })
                                    .appendTo($('.image-map-img-container'));

                                const midLeft = document.createElement('div');
                                $(midLeft).addClass('image-map-overlay mid-left')
                                    .css({
                                        left: '0px',
                                        top: imageMapCoords[1] + 'px',
                                        width: imageMapCoords[0] + 'px',
                                        height: (imageMapCoords[3] - imageMapCoords[1]) + 'px'
                                    })
                                    .appendTo($('.image-map-img-container'));

                                const bottomLeft = document.createElement('div');
                                $(bottomLeft).addClass('image-map-overlay bottom-left')
                                    .css({
                                        left: '0px',
                                        top: imageMapCoords[3] + 'px',
                                        width: imageMapCoords[0] + 'px',
                                        height: 'calc(100% - ' + imageMapCoords[3] + 'px)'
                                    })
                                    .appendTo($('.image-map-img-container'));

                                const bottomMid = document.createElement('div');
                                $(bottomMid).addClass('image-map-overlay bottom-mid')
                                    .css({
                                        left: imageMapCoords[0] + 'px',
                                        top: imageMapCoords[3] + 'px',
                                        width: (imageMapCoords[2] - imageMapCoords[0]) + 'px',
                                        height: 'calc(100% - ' + imageMapCoords[3] + 'px)'
                                    })
                                    .appendTo($('.image-map-img-container'));

                                const bottomRight = document.createElement('div');
                                $(bottomRight).addClass('image-map-overlay bottom-right')
                                    .css({
                                        left: imageMapCoords[2] + 'px',
                                        top: imageMapCoords[3] + 'px',
                                        width: 'calc(100% - ' + imageMapCoords[2] + 'px)',
                                        height: 'calc(100% - ' + imageMapCoords[3] + 'px)'
                                    })
                                    .appendTo($('.image-map-img-container'));
                                const mapBorder = document.createElement('div');
                                $(mapBorder).addClass('image-map-border')
                                    .css({
                                        left: imageMapCoords[0] + 'px',
                                        top: imageMapCoords[1] + 'px',
                                        width: (imageMapCoords[2] - imageMapCoords[0]) + 'px',
                                        height: (imageMapCoords[3] - imageMapCoords[1]) + 'px'
                                    })
                                    .appendTo($('.image-map-img-container'));
                            };

                            const summaryValues = () => {
                                return _.filter(_.map(assessment.answers[0]._embedded.categories, (category) => {
                                    const categoryQ = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (questionCategory) => {
                                        return questionCategory.id === category.id;
                                    });
                                    const answersList = _.compact(_.flatten(_.map(category._embedded.iterations, (iteration) => {
                                        return _.flatten(_.map(iteration._embedded.questions, (question) => {
                                            let position = null;
                                            let positionResult = null;
                                            if ((isMM && parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10)) || (!isMM && question.detailLevel <= assessment.detailLevel)) {
                                                const categoryQ = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (questionCategory) => {
                                                    return questionCategory.id === category.id;
                                                });
                                                const questionQ = question ? _.find(categoryQ._embedded.questions, (questionQuestion) => {
                                                    return questionQuestion.id === question.id;
                                                }) : null;
                                                const option = _.find(questionQ._embedded.options, (option) => {
                                                    return option.id === question.answer;
                                                });
                                                position = option ? option.position : null;

                                                const priority = calculatePriority(question.priority);
                                                const positionNumber = parseInt(position);
                                                let positions = [];
                                                if (assessment.detailLevel !== '1' && isMM) {
                                                    for (let i = 0; i < priority; i++) {
                                                        positions.push(positionNumber);
                                                    }
                                                    positionResult = positions;
                                                } else {
                                                    positionResult = positionNumber;
                                                }
                                            }

                                            return positionResult;
                                        }));
                                    })));

                                    return {
                                        category: categoryQ.name,
                                        answerAverage: answersList ? Math.round(_.mean(answersList) * 10) / 10 : null
                                    };
                                }), (category) => {
                                    return category.answerAverage;
                                });
                            };

                            const summaryCalculations = () => {
                                const key = result.data._embedded.questionnaires[0].key;
                                const numberOfSections = key === 'mm' ? 5 : 4;
                                const offsetConstant = key === 'mm' ? 10 : 12.5;

                                $('.marker').each((index, element) => {
                                    const score = $(element).data('score');
                                    const offset = (score - 1) / numberOfSections * 100 + offsetConstant;
                                    const colorScore = Math.round(score);
                                    let color = '#de2a2d';
                                    if (colorScore <= 2) {
                                        color = '#7eba41';
                                    } else if (colorScore === 3 && numberOfSections === 4) {
                                        color = '#fcb830';
                                    } else if (colorScore === 3 && numberOfSections === 5) {
                                        color = '#949494';
                                    } else if (colorScore === 4 && numberOfSections === 5) {
                                        color = '#fcb830';
                                    } else if (colorScore === 5 && numberOfSections === 5) {
                                        color = '#de2a2d';
                                    }
                                    $(element).css('left', 'calc(' + offset + '% - 5px)').css('background-color', color);
                                });
                                $('.average-number').each((index, element) => {
                                    const score = $(element).data('score');
                                    const offset = (score - 1) / numberOfSections * 100 + offsetConstant;
                                    $(element).css('margin-left', 'calc(' + offset + '% - 15px)');
                                });
                            };

                            const detailsValues = () => {
                                return _.filter(_.map(assessment.answers[0]._embedded.categories, (category) => {
                                    const categoryQ = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (questionCategory) => {
                                        return questionCategory.id === category.id;
                                    });
                                    const answersList = _.map(category._embedded.iterations, (iteration) => {
                                        const iterationQ = _.map(iteration._embedded.questions, (question) => {
                                            if ((isMM && parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10)) || (!isMM && question.detailLevel <= assessment.detailLevel)) {
                                                const questionQ = question ? _.find(categoryQ._embedded.questions, (questionQuestion) => {
                                                    return questionQuestion.id === question.id;
                                                }) : null;
                                                const option = _.find(questionQ._embedded.options, (option) => {
                                                    return option.id === question.answer;
                                                });
                                                const selectedOption = questionQ._embedded.options.length && option ? option.position : null;
                                                const priority = calculatePriority(question.priority);
                                                const preppedPriority = (5 - parseInt(selectedOption, 10)) * priority;
                                                let urgency = 'none';
                                                if (preppedPriority >= 6) {
                                                    urgency = 'red';
                                                } else if (preppedPriority <= 3) {
                                                    urgency = 'green';
                                                } else if (preppedPriority > 3 && preppedPriority < 6) {
                                                    urgency = 'yellow';
                                                }

                                                const allStatuses = questionQ._embedded.options ? _.map(questionQ._embedded.options, (optionQ) => {
                                                    return {
                                                        currentStatus: optionQ.currentStatus,
                                                        isSelected: optionQ.id === question.answer
                                                    };
                                                }) : null;

                                                return {
                                                    name: questionQ.name,
                                                    hasOptions: !!questionQ._embedded.options.length,
                                                    position: selectedOption,
                                                    option: questionQ._embedded.options.length && option ? option : null,
                                                    comments: question.comments,
                                                    priority: priority,
                                                    moreInformation: questionQ.moreInformation,
                                                    urgency: urgency,
                                                    allStatuses: allStatuses
                                                };
                                            } else {
                                                return null;
                                            }
                                        });
                                        const filteredQuestions = _.filter(iterationQ, (question) => {
                                            return question !== null;
                                        });
                                        if (((iterationQ && category.isRepeatable === true && iteration.name && iteration.name !== '') || (iterationQ && category.isRepeatable !== true)) && filteredQuestions.length) {
                                            return {
                                                name: iteration.name,
                                                questions: filteredQuestions
                                            };
                                        } else {
                                            return null;
                                        }
                                    });
                                    const filteredAnswersList = _.filter(answersList, (iteration) => {
                                        return iteration !== null;
                                    });
                                    if (filteredAnswersList.length) {
                                        return {
                                            category: categoryQ.name,
                                            comments: category.comments,
                                            iterations: filteredAnswersList
                                        };
                                    } else {
                                        return null;
                                    }
                                }), (category) => {
                                    return category !== null && category.category !== constants.specializedTemplates.introCategory;
                                });
                            };

                            const summarySetup = () => {
                                const details = {
                                    questionnaire: result.data._embedded.questionnaires[0].name,
                                    surveyId: result.data.surveyId,
                                    name: assessment.projectName,
                                    contact: assessment.mainContact,
                                    status: assessment.projectStatus,
                                    data: detailsValues()
                                };
                                const values = summaryValues();

                                shared.setSurveyContent($, placeholder, questionnaireSummaryTemplate({
                                    details: details,
                                    values: values,
                                    title: assessment.projectName,
                                    feedbackUrl: feedbackUrl,
                                    url: result.data._links.docx.href,
                                    data: JSON.stringify(
                                        {
                                            details: details,
                                            values: values
                                        }
                                    )
                                }));
                                summaryCalculations();
                            };

                            const updateQuestionContent = (outOfBounds = '') => {
                                const progressPosition = categories[categoryPointer] ? _.findIndex(progressFilteredCategories, function(o) {
                                    return o.id && o.id === categories[categoryPointer].id;
                                }) : null;
                                progress = (progressPosition + 1) / progressFilteredCategories.length * 100;
                                const currentCategory = categories[categoryPointer] ? _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                    return category.id === categories[categoryPointer].id;
                                }) : null;

                                if (outOfBounds !== '') {
                                    if (outOfBounds === 'front') {

                                    } else if (outOfBounds === 'end') {
                                        progress = 100;
                                        summarySetup();
                                    }
                                } else if (questionPointer === -1) {
                                    const values = templateValues();
                                    shared.setSurveyContent($, placeholder, questionnaireIterationTemplate({category: values.category, iterations: categories[categoryPointer]._embedded.iterations, image: values.image}));
                                    if (values.imageMap) {
                                        createImageMapElements(values.imageMap);
                                    }
                                } else {
                                    if (currentCategory && currentCategory.name === constants.specializedTemplates.introCategory) {
                                        const currentQuestion = questions[questionPointer] ? _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                            return question.id === questions[questionPointer].id;
                                        })) : null;
                                        if (currentQuestion && currentQuestion.name === constants.specializedTemplates.description) {
                                            const questionnaire = _.find(result.data._embedded.questionnaires, ['id', result.data.surveyId]);
                                            const questionnaireUrl = questionnaire ? questionnaire._links.self.href : '';
                                            projectDescription($, placeholder, assessment, currentQuestion, questionnaireUrl);
                                        } else if (currentQuestion && currentQuestion.name === constants.specializedTemplates.details) {
                                            shared.setSurveyContent($, placeholder, questionnaireLevelsTemplate({level: assessment.detailLevel, question: currentQuestion, detailedEnabled: result.data.warpjsUser !== null && result.data.warpjsUser.UserName !== null}));

                                            var data = {
                                                name: "flare",
                                                children: [
                                                    {
                                                        name: "analytics",
                                                        children: [
                                                            {
                                                                name: "cluster",
                                                                children: [
                                                                    {name: "AgglomerativeCluster", value: 3938},
                                                                    {name: "CommunityStructure", value: 3812},
                                                                    {name: "HierarchicalCluster", value: 6714},
                                                                    {name: "MergeEdge", value: 743}
                                                                ]
                                                            },
                                                            {
                                                                name: "graph",
                                                                children: [
                                                                    {name: "BetweennessCentrality", value: 3534},
                                                                    {name: "LinkDistance", value: 5731},
                                                                    {name: "MaxFlowMinCut", value: 7840},
                                                                    {name: "ShortestPaths", value: 5914},
                                                                    {name: "SpanningTree", value: 3416}
                                                                ]
                                                            },
                                                            {
                                                                name: "optimization",
                                                                children: [
                                                                    {name: "AspectRatioBanker", value: 7074}
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        name: "animate",
                                                        children: [
                                                            {name: "Easing", value: 17010},
                                                            {name: "FunctionSequence", value: 5842},
                                                            {
                                                                name: "interpolate",
                                                                children: [
                                                                    {name: "ArrayInterpolator", value: 1983},
                                                                    {name: "ColorInterpolator", value: 2047},
                                                                    {name: "DateInterpolator", value: 1375},
                                                                    {name: "Interpolator", value: 8746},
                                                                    {name: "MatrixInterpolator", value: 2202},
                                                                    {name: "NumberInterpolator", value: 1382},
                                                                    {name: "ObjectInterpolator", value: 1629},
                                                                    {name: "PointInterpolator", value: 1675},
                                                                    {name: "RectangleInterpolator", value: 2042}
                                                                ]
                                                            },
                                                            {name: "ISchedulable", value: 1041},
                                                            {name: "Parallel", value: 5176},
                                                            {name: "Pause", value: 449},
                                                            {name: "Scheduler", value: 5593},
                                                            {name: "Sequence", value: 5534},
                                                            {name: "Transition", value: 9201},
                                                            {name: "Transitioner", value: 19975},
                                                            {name: "TransitionEvent", value: 1116},
                                                            {name: "Tween", value: 6006}
                                                        ]
                                                    },
                                                    {
                                                        name: "data",
                                                        children: [
                                                            {
                                                                name: "converters",
                                                                children: [
                                                                    {name: "Converters", value: 721},
                                                                    {name: "DelimitedTextConverter", value: 4294},
                                                                    {name: "GraphMLConverter", value: 9800},
                                                                    {name: "IDataConverter", value: 1314},
                                                                    {name: "JSONConverter", value: 2220}
                                                                ]
                                                            },
                                                            {name: "DataField", value: 1759},
                                                            {name: "DataSchema", value: 2165},
                                                            {name: "DataSet", value: 586},
                                                            {name: "DataSource", value: 3331},
                                                            {name: "DataTable", value: 772},
                                                            {name: "DataUtil", value: 3322}
                                                        ]
                                                    },
                                                    {
                                                        name: "display",
                                                        children: [
                                                            {name: "DirtySprite", value: 8833},
                                                            {name: "LineSprite", value: 1732},
                                                            {name: "RectSprite", value: 3623},
                                                            {name: "TextSprite", value: 10066}
                                                        ]
                                                    },
                                                    {
                                                        name: "flex",
                                                        children: [
                                                            {name: "FlareVis", value: 4116}
                                                        ]
                                                    },
                                                    {
                                                        name: "physics",
                                                        children: [
                                                            {name: "DragForce", value: 1082},
                                                            {name: "GravityForce", value: 1336},
                                                            {name: "IForce", value: 319},
                                                            {name: "NBodyForce", value: 10498},
                                                            {name: "Particle", value: 2822},
                                                            {name: "Simulation", value: 9983},
                                                            {name: "Spring", value: 2213},
                                                            {name: "SpringForce", value: 1681}
                                                        ]
                                                    },
                                                    {
                                                        name: "query",
                                                        children: [
                                                            {name: "AggregateExpression", value: 1616},
                                                            {name: "And", value: 1027},
                                                            {name: "Arithmetic", value: 3891},
                                                            {name: "Average", value: 891},
                                                            {name: "BinaryExpression", value: 2893},
                                                            {name: "Comparison", value: 5103},
                                                            {name: "CompositeExpression", value: 3677},
                                                            {name: "Count", value: 781},
                                                            {name: "DateUtil", value: 4141},
                                                            {name: "Distinct", value: 933},
                                                            {name: "Expression", value: 5130},
                                                            {name: "ExpressionIterator", value: 3617},
                                                            {name: "Fn", value: 3240},
                                                            {name: "If", value: 2732},
                                                            {name: "IsA", value: 2039},
                                                            {name: "Literal", value: 1214},
                                                            {name: "Match", value: 3748},
                                                            {name: "Maximum", value: 843},
                                                            {
                                                                name: "methods",
                                                                children: [
                                                                    {name: "add", value: 593},
                                                                    {name: "and", value: 330},
                                                                    {name: "average", value: 287},
                                                                    {name: "count", value: 277},
                                                                    {name: "distinct", value: 292},
                                                                    {name: "div", value: 595},
                                                                    {name: "eq", value: 594},
                                                                    {name: "fn", value: 460},
                                                                    {name: "gt", value: 603},
                                                                    {name: "gte", value: 625},
                                                                    {name: "iff", value: 748},
                                                                    {name: "isa", value: 461},
                                                                    {name: "lt", value: 597},
                                                                    {name: "lte", value: 619},
                                                                    {name: "max", value: 283},
                                                                    {name: "min", value: 283},
                                                                    {name: "mod", value: 591},
                                                                    {name: "mul", value: 603},
                                                                    {name: "neq", value: 599},
                                                                    {name: "not", value: 386},
                                                                    {name: "or", value: 323},
                                                                    {name: "orderby", value: 307},
                                                                    {name: "range", value: 772},
                                                                    {name: "select", value: 296},
                                                                    {name: "stddev", value: 363},
                                                                    {name: "sub", value: 600},
                                                                    {name: "sum", value: 280},
                                                                    {name: "update", value: 307},
                                                                    {name: "variance", value: 335},
                                                                    {name: "where", value: 299},
                                                                    {name: "xor", value: 354},
                                                                    {name: "_", value: 264}
                                                                ]
                                                            },
                                                            {name: "Minimum", value: 843},
                                                            {name: "Not", value: 1554},
                                                            {name: "Or", value: 970},
                                                            {name: "Query", value: 13896},
                                                            {name: "Range", value: 1594},
                                                            {name: "StringUtil", value: 4130},
                                                            {name: "Sum", value: 791},
                                                            {name: "Variable", value: 1124},
                                                            {name: "Variance", value: 1876},
                                                            {name: "Xor", value: 1101}
                                                        ]
                                                    },
                                                    {
                                                        name: "scale",
                                                        children: [
                                                            {name: "IScaleMap", value: 2105},
                                                            {name: "LinearScale", value: 1316},
                                                            {name: "LogScale", value: 3151},
                                                            {name: "OrdinalScale", value: 3770},
                                                            {name: "QuantileScale", value: 2435},
                                                            {name: "QuantitativeScale", value: 4839},
                                                            {name: "RootScale", value: 1756},
                                                            {name: "Scale", value: 4268},
                                                            {name: "ScaleType", value: 1821},
                                                            {name: "TimeScale", value: 5833}
                                                        ]
                                                    },
                                                    {
                                                        name: "util",
                                                        children: [
                                                            {name: "Arrays", value: 8258},
                                                            {name: "Colors", value: 10001},
                                                            {name: "Dates", value: 8217},
                                                            {name: "Displays", value: 12555},
                                                            {name: "Filter", value: 2324},
                                                            {name: "Geometry", value: 10993},
                                                            {
                                                                name: "heap",
                                                                children: [
                                                                    {name: "FibonacciHeap", value: 9354},
                                                                    {name: "HeapNode", value: 1233}
                                                                ]
                                                            },
                                                            {name: "IEvaluable", value: 335},
                                                            {name: "IPredicate", value: 383},
                                                            {name: "IValueProxy", value: 874},
                                                            {
                                                                name: "math",
                                                                children: [
                                                                    {name: "DenseMatrix", value: 3165},
                                                                    {name: "IMatrix", value: 2815},
                                                                    {name: "SparseMatrix", value: 3366}
                                                                ]
                                                            },
                                                            {name: "Maths", value: 17705},
                                                            {name: "Orientation", value: 1486},
                                                            {
                                                                name: "palette",
                                                                children: [
                                                                    {name: "ColorPalette", value: 6367},
                                                                    {name: "Palette", value: 1229},
                                                                    {name: "ShapePalette", value: 2059},
                                                                    {name: "SizePalette", value: 2291}
                                                                ]
                                                            },
                                                            {name: "Property", value: 5559},
                                                            {name: "Shapes", value: 19118},
                                                            {name: "Sort", value: 6887},
                                                            {name: "Stats", value: 6557},
                                                            {name: "Strings", value: 22026}
                                                        ]
                                                    },
                                                    {
                                                        name: "vis",
                                                        children: [
                                                            {
                                                                name: "axis",
                                                                children: [
                                                                    {name: "Axes", value: 1302},
                                                                    {name: "Axis", value: 24593},
                                                                    {name: "AxisGridLine", value: 652},
                                                                    {name: "AxisLabel", value: 636},
                                                                    {name: "CartesianAxes", value: 6703}
                                                                ]
                                                            },
                                                            {
                                                                name: "controls",
                                                                children: [
                                                                    {name: "AnchorControl", value: 2138},
                                                                    {name: "ClickControl", value: 3824},
                                                                    {name: "Control", value: 1353},
                                                                    {name: "ControlList", value: 4665},
                                                                    {name: "DragControl", value: 2649},
                                                                    {name: "ExpandControl", value: 2832},
                                                                    {name: "HoverControl", value: 4896},
                                                                    {name: "IControl", value: 763},
                                                                    {name: "PanZoomControl", value: 5222},
                                                                    {name: "SelectionControl", value: 7862},
                                                                    {name: "TooltipControl", value: 8435}
                                                                ]
                                                            },
                                                            {
                                                                name: "data",
                                                                children: [
                                                                    {name: "Data", value: 20544},
                                                                    {name: "DataList", value: 19788},
                                                                    {name: "DataSprite", value: 10349},
                                                                    {name: "EdgeSprite", value: 3301},
                                                                    {name: "NodeSprite", value: 19382},
                                                                    {
                                                                        name: "render",
                                                                        children: [
                                                                            {name: "ArrowType", value: 698},
                                                                            {name: "EdgeRenderer", value: 5569},
                                                                            {name: "IRenderer", value: 353},
                                                                            {name: "ShapeRenderer", value: 2247}
                                                                        ]
                                                                    },
                                                                    {name: "ScaleBinding", value: 11275},
                                                                    {name: "Tree", value: 7147},
                                                                    {name: "TreeBuilder", value: 9930}
                                                                ]
                                                            },
                                                            {
                                                                name: "events",
                                                                children: [
                                                                    {name: "DataEvent", value: 2313},
                                                                    {name: "SelectionEvent", value: 1880},
                                                                    {name: "TooltipEvent", value: 1701},
                                                                    {name: "VisualizationEvent", value: 1117}
                                                                ]
                                                            },
                                                            {
                                                                name: "legend",
                                                                children: [
                                                                    {name: "Legend", value: 20859},
                                                                    {name: "LegendItem", value: 4614},
                                                                    {name: "LegendRange", value: 10530}
                                                                ]
                                                            },
                                                            {
                                                                name: "operator",
                                                                children: [
                                                                    {
                                                                        name: "distortion",
                                                                        children: [
                                                                            {name: "BifocalDistortion", value: 4461},
                                                                            {name: "Distortion", value: 6314},
                                                                            {name: "FisheyeDistortion", value: 3444}
                                                                        ]
                                                                    },
                                                                    {
                                                                        name: "encoder",
                                                                        children: [
                                                                            {name: "ColorEncoder", value: 3179},
                                                                            {name: "Encoder", value: 4060},
                                                                            {name: "PropertyEncoder", value: 4138},
                                                                            {name: "ShapeEncoder", value: 1690},
                                                                            {name: "SizeEncoder", value: 1830}
                                                                        ]
                                                                    },
                                                                    {
                                                                        name: "filter",
                                                                        children: [
                                                                            {name: "FisheyeTreeFilter", value: 5219},
                                                                            {name: "GraphDistanceFilter", value: 3165},
                                                                            {name: "VisibilityFilter", value: 3509}
                                                                        ]
                                                                    },
                                                                    {name: "IOperator", value: 1286},
                                                                    {
                                                                        name: "label",
                                                                        children: [
                                                                            {name: "Labeler", value: 9956},
                                                                            {name: "RadialLabeler", value: 3899},
                                                                            {name: "StackedAreaLabeler", value: 3202}
                                                                        ]
                                                                    },
                                                                    {
                                                                        name: "layout",
                                                                        children: [
                                                                            {name: "AxisLayout", value: 6725},
                                                                            {name: "BundledEdgeRouter", value: 3727},
                                                                            {name: "CircleLayout", value: 9317},
                                                                            {name: "CirclePackingLayout", value: 12003},
                                                                            {name: "DendrogramLayout", value: 4853},
                                                                            {name: "ForceDirectedLayout", value: 8411},
                                                                            {name: "IcicleTreeLayout", value: 4864},
                                                                            {name: "IndentedTreeLayout", value: 3174},
                                                                            {name: "Layout", value: 7881},
                                                                            {name: "NodeLinkTreeLayout", value: 12870},
                                                                            {name: "PieLayout", value: 2728},
                                                                            {name: "RadialTreeLayout", value: 12348},
                                                                            {name: "RandomLayout", value: 870},
                                                                            {name: "StackedAreaLayout", value: 9121},
                                                                            {name: "TreeMapLayout", value: 9191}
                                                                        ]
                                                                    },
                                                                    {name: "Operator", value: 2490},
                                                                    {name: "OperatorList", value: 5248},
                                                                    {name: "OperatorSequence", value: 4190},
                                                                    {name: "OperatorSwitch", value: 2581},
                                                                    {name: "SortOperator", value: 2023}
                                                                ]
                                                            },
                                                            {name: "Visualization", value: 16540}
                                                        ]
                                                    }
                                                ]
                                            };

                                            const width = 932;
                                            const radius = width / 2;
                                            // const tree = (data) => {
                                            //     d3.tree()
                                            //         .size([2 * Math.PI, radius])
                                            //         .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
                                            //     return d3.hierarchy(data);
                                            // };

                                            const tree = (data) => {
                                                const root = d3.hierarchy(data);
                                                return d3.tree().size([2 * Math.PI, radius]).separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)(root);
                                            };

                                            const root1 = tree(data);
                                            console.log('root1', root1);

                                            const svg = d3.select('svg.spider');

                                            const autosize = function(svg) {
                                                const box = svg.getBBox();
                                                svg.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
                                            };

                                            svg.append("g")
                                                .attr("fill", "none")
                                                .attr("stroke", "#555")
                                                .attr("stroke-opacity", 0.4)
                                                .attr("stroke-width", 1.5)
                                                .selectAll("path")
                                                .data(root1.links())
                                                .join("path")
                                                .attr("d", d3.linkRadial()
                                                    .angle(d => d.x)
                                                    .radius(d => d.y));

                                            const node = svg.append("g")
                                                .attr("stroke-linejoin", "round")
                                                .attr("stroke-width", 3)
                                                .selectAll("g")
                                                .data(root1.descendants().reverse())
                                                .join("g")
                                                .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90})translate(${d.y},0)`);

                                            node.append("circle")
                                                .attr("fill", d => d.children ? "#555" : "#999")
                                                .attr("r", 2.5);

                                            node.append("text")
                                                .attr("dy", "0.31em")
                                                .attr("x", d => (d.x < Math.PI) === !d.children ? 6 : -6)
                                                .attr("text-anchor", d => (d.x < Math.PI) === !d.children ? "start" : "end")
                                                .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
                                                .text(d => d.data.name)
                                                .clone(true).lower()
                                                .attr("stroke", "white");

                                            autosize(svg.node());

                                            assignDetailLevelSelected();
                                        } else {
                                            shared.setSurveyContent($, placeholder, questionnaireIntroTemplate(introTemplateValues()));
                                        }
                                    } else {
                                        const values = templateValues();
                                        shared.setSurveyContent($, placeholder, questionnaireTemplate(values));
                                        if (values.imageMap) {
                                            createImageMapElements(values.imageMap);
                                        }

                                        $('.image-map-img-container > img').css({width: values.imageWidth ? values.imageWidth : 'auto', height: values.imageHeight ? values.imageHeight : 'auto'});
                                    }
                                }

                                $('.survey-tool .progress-bar').css('width', progress + '%');
                                styleRadio();
                            };

                            const updateIterations = () => {
                                const category = assessment.answers[0]._embedded.categories[categoryPointer];
                                category._embedded.iterations[0].name = $('input#iteration1').val();
                                category._embedded.iterations[1].name = $('input#iteration2').val();
                                category._embedded.iterations[2].name = $('input#iteration3').val();
                                category._embedded.iterations[3].name = $('input#iteration4').val();
                                category._embedded.iterations[4].name = $('input#iteration5').val();
                                category._embedded.iterations[5].name = $('input#iteration6').val();
                                category.comments = $('textarea.comment-text').val();
                            };

                            const updateQuestions = () => {
                                if (questions && questions[questionPointer]) {
                                    questions[questionPointer].answer = $("input[name='question-options'][checked='checked']").val();
                                    questions[questionPointer].priority = $("input[name='priority-options'][checked='checked']").val();
                                    questions[questionPointer].comments = $('textarea.comment-text').val();
                                }
                            };

                            const iterationClick = (direction) => {
                                let hasIteration = false;
                                $('.iteration-form input[type="text"]').each((index, element) => {
                                    if ($(element).val()) {
                                        hasIteration = true;
                                    }
                                });
                                if (hasIteration || direction === 'back') {
                                    getAssessment();
                                    updateIterations();
                                    updatePointers(direction);
                                    updateAssessment();
                                } else {
                                    $('.iteration-form input[type="text"]').first().addClass('is-invalid');
                                    $('.invalid-feedback').css('display', 'block');
                                }
                            };

                            const detailsSetup = () => {
                                const details = {
                                    questionnaire: result.data._embedded.questionnaires[0].name,
                                    name: assessment.projectName,
                                    contact: assessment.mainContact,
                                    status: assessment.projectStatus,
                                    data: detailsValues()
                                };
                                const values = summaryValues();
                                shared.setSurveyContent($, placeholder, questionnaireDetailsTemplate({
                                    details: details,
                                    values: values,
                                    title: assessment.projectName,
                                    url: result.data._links.docx.href,
                                    feedbackUrl: feedbackUrl,
                                    data: JSON.stringify(
                                        {
                                            details: details,
                                            values: values
                                        }
                                    )
                                }));
                                $('.current-status ~ div').addClass('show-status-next');
                                $('.has-comments').append('<a class="has-comments-after" data-toggle="modal" data-target="#comments-modal"></a>');
                                $(document).on('click', '.has-comments-after', (event) => {
                                    const comment = $(event.target).parent().data('comments');
                                    $('.comment-text').css('display', 'none');
                                    $('.comment-text-not-editable').css('display', 'block');
                                    $('.comment-text-not-editable').html(comment);
                                });

                                $('.detail-question-status-container').each(function() {
                                    const paddingAmount = $(this).innerWidth() - $(this).find('.blue-card').outerWidth(true);
                                    const containerWidth = $(this).find('.blue-card').length * ($(this).find('.blue-card').outerWidth(true) + 3) + $(this).find('.status-arrow').length * ($(this).find('.status-arrow').outerWidth(true) + 4) + paddingAmount;
                                    $(this).css('width', containerWidth);
                                    if ($('.detail-question-status-container').find('.current-status').length && $(this).find('.current-status').position()) {
                                        const scrollDistance = $(this).find('.current-status').position().left - (paddingAmount / 2);
                                        $(this).closest('.detail-status-cutoff').scrollLeft(scrollDistance);
                                    }
                                });
                            };

                            let flattenedAnswers = [];
                            let weightAdjustment = 0;
                            let weightAdjustmentEven = false;

                            const relatedReadingSetup = () => {
                                flattenedAnswers = [];
                                let numberOfOptions = 0;
                                _.each(assessment.answers[0]._embedded.categories, (rCategory) => {
                                    _.each(rCategory._embedded.iterations, (rIteration) => {
                                        _.each(rIteration._embedded.questions, (rQuestion) => {
                                            if (((isMM && parseInt(rQuestion.detailLevel, 10) === parseInt(assessment.detailLevel, 10)) || (!isMM && rQuestion.detailLevel <= assessment.detailLevel)) && rQuestion.answer) {
                                                const questionCategory = rCategory ? _.find(result.data._embedded.questionnaires[0]._embedded.categories, (qCategory) => {
                                                    return qCategory.id === rCategory.id;
                                                }) : null;
                                                const questionQuestion = questionCategory ? _.find(questionCategory._embedded.questions, (qQuestion) => {
                                                    return qQuestion.id === rQuestion.id;
                                                }) : null;
                                                numberOfOptions = Math.max(numberOfOptions, questionQuestion._embedded.options.length);
                                                const questionAnswer = questionQuestion ? _.find(questionQuestion._embedded.options, (qOption) => {
                                                    return qOption.id === rQuestion.answer;
                                                }) : null;
                                                flattenedAnswers.push({
                                                    id: rQuestion.id,
                                                    answer: questionAnswer ? questionAnswer.position : null,
                                                    questionName: questionQuestion ? questionQuestion.name : null,
                                                    answerName: questionAnswer ? questionAnswer.name : null
                                                });
                                            }
                                        });
                                    });
                                });

                                weightAdjustment = Math.ceil(numberOfOptions / 2);
                                weightAdjustmentEven = numberOfOptions % 2 === 0;

                                _.each(result.data._embedded.questionnaires[0]._embedded.resultSets, (resultSet) => {
                                    resultSet.recommendation = null;
                                    _.each(resultSet._embedded.results, (result) => {
                                        result.points = 0;
                                        _.each(result._embedded.relevantQuestions, (relevantQuestion) => {
                                            _.each(relevantQuestion ? _.filter(flattenedAnswers, (aQuestion) => {
                                                return aQuestion.id === relevantQuestion.id;
                                            }) : null, (aQuestion) => {
                                                if (relevantQuestion.relevance === 'high') {
                                                    result.points += Math.max(0, parseInt(aQuestion.answer, 10) - weightAdjustment);
                                                } else if (relevantQuestion.relevance === 'low') {
                                                    result.points += Math.max(0, (5 - parseInt(aQuestion.answer, 10)) - weightAdjustment);
                                                }
                                            });
                                        });
                                        result.points = result._embedded.relevantQuestions.length > 0 ? result.points / result._embedded.relevantQuestions.length : 0;
                                        const unroundedStars = result.points / Math.floor(numberOfOptions / 2) * 5;
                                        // since stars are rounded up, mod === 0 means it should be a full star.
                                        result.starRemainder = unroundedStars % 1 === 0 ? 2 : Math.round((unroundedStars % 1) * 2);
                                        result.stars = Math.ceil(unroundedStars);
                                        result.textRank = Math.max(Math.round(unroundedStars), 1);
                                    });

                                    resultSet.orderedRecommendations = _.orderBy(_.filter(resultSet._embedded.results, (result) => {
                                        return result.points > 0;
                                    }), ['points'], ['desc']);

                                    const recommendation = _.orderBy(_.filter(resultSet._embedded.results, (result) => {
                                        return result.points > 0;
                                    }), ['points'], ['desc'])[0];

                                    const existingFeedback = _.find(assessment.resultsetFeedback, (feedback) => {
                                        return feedback.resultsetId === resultSet.id && feedback.resultId === recommendation.id && feedback.feedbackType === 'result';
                                    });

                                    if (existingFeedback) {
                                        recommendation.thumbValue = existingFeedback.thumbValue.toLowerCase();
                                    }

                                    resultSet.recommendation = recommendation;
                                    resultSet.recommendationName = recommendation ? recommendation.name : null;
                                });
                                shared.setSurveyContent($, placeholder, questionnaireRelatedReadingTemplate({readings: result.data._embedded.questionnaires[0]._embedded.resultSets, feedbackUrl: feedbackUrl}));
                            };

                            if (assessment.answers[0]._embedded.categories[categoryPointer].isRepeatable === true) {
                                questionPointer = -1;
                            }

                            categories = assessment.answers[0]._embedded.categories;
                            iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                            });
                            questions = iterations.length > 0 ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                return isMM ? parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : question.detailLevel <= assessment.detailLevel;
                            }) : [];

                            updateQuestionContent();

                            $(document).on('click', '.question-next', () => {
                                getAssessment();
                                updateQuestions();
                                updatePointers('next');
                                updateAssessment();
                            });
                            $(document).on('click', '.question-back', () => {
                                getAssessment();
                                updateQuestions();
                                updatePointers('back');
                                updateAssessment();
                            });
                            $(document).on('click', '.question-next-intro, .question-back-intro', (event) => {
                                const direction = $(event.target).hasClass('question-back-intro') ? 'back' : 'next';
                                updatePointers(direction);
                            });
                            $(document).on('click', '.iteration-next', () => {
                                iterationClick('next');
                            });
                            $(document).on('click', '.iteration-back', () => {
                                iterationClick('back');
                            });
                            $(document).on('click', '.summary-back', () => {
                                updateQuestionContent();
                            });
                            $(document).on('click', '.details-next, .email-back-to-related', () => {
                                relatedReadingSetup();
                            });
                            $(document).on('click', '.details-back', () => {
                                summarySetup();
                            });
                            $(document).on('click', '.summary-next, .related-reading-back, .email-back-to-details', () => {
                                detailsSetup();
                            });
                            $(document).on('click', '.next-to-email-form', () => {
                                shared.setSurveyContent($, placeholder, emailFormTemplate());
                            });

                            $(document).on('click', '.show-related-all', (event) => {
                                const resultSetId = $(event.target).data('warpjsResultSet');
                                const relatedResultSet = _.find(result.data._embedded.questionnaires[0]._embedded.resultSets, (resultSet) => {
                                    return resultSet.id === resultSetId;
                                });

                                shared.setSurveyContent($, placeholder, questionnaireRelatedAllTemplate({resultSet: relatedResultSet, orderedRecommendations: relatedResultSet.orderedRecommendations}));
                            });

                            const readMoreSetup = (resultSetId, relatedResultSet) => {
                                relatedResultSet.recommendation.questions = _.filter(flattenedAnswers, (flat) => {
                                    const found = _.find(relatedResultSet.recommendation._embedded.relevantQuestions, (relevantQuestion) => {
                                        return relevantQuestion.id === flat.id && ((parseInt(flat.answer, 10) > weightAdjustment && relevantQuestion.relevance === 'high') || (((parseInt(flat.answer, 10) <= weightAdjustment && weightAdjustmentEven) || (parseInt(flat.answer, 10) < weightAdjustment && !weightAdjustmentEven)) && relevantQuestion.relevance === 'low'));
                                    });
                                    return found;
                                });

                                if (relatedResultSet.recommendation) {
                                    const result = _.find(relatedResultSet._embedded.results, (result) => {
                                        return result.id === relatedResultSet.recommendation.id;
                                    });

                                    _.each(relatedResultSet.recommendation.questions, (recommendationQuestion) => {
                                        const question = _.find(result._embedded.relevantQuestions, (relevantQuestion) => {
                                            return relevantQuestion.id === recommendationQuestion.id;
                                        });
                                        const existingFeedback = _.find(assessment.resultsetFeedback, (feedback) => {
                                            return feedback.resultsetId === relatedResultSet.id && feedback.resultId === result.id && feedback.questionId === question.id;
                                        });

                                        recommendationQuestion.feedbackLink = question && question._links && question._links.submitFeedback ? question._links.submitFeedback.href : null;
                                        if (existingFeedback) {
                                            recommendationQuestion.thumbValue = existingFeedback.thumbValue.toLowerCase();
                                        }
                                    });
                                }

                                let contentPreview = null;
                                let contentDocumentHref = null;
                                if (relatedResultSet.recommendation && relatedResultSet.recommendation._embedded.contents[0] && relatedResultSet.recommendation._embedded.contents[0]._embedded.overviews) {
                                    contentPreview = _.find(relatedResultSet.recommendation._embedded.contents[0]._embedded.overviews, (overview) => {
                                        return parseInt(overview.position, 10) === 1;
                                    });

                                    contentDocumentHref = relatedResultSet.recommendation._embedded.contents[0]._links.self.href;
                                }

                                shared.setSurveyContent($, placeholder, questionnaireRelatedDetailsTemplate({resultSet: relatedResultSet, contentPreview: contentPreview, href: contentDocumentHref, feedbackUrl: feedbackUrl}));
                            };

                            $(document).on('click', '.related-read-more', (event) => {
                                getAssessment();
                                $('.progress-container, .blue-button-container').css('display', 'none');
                                const resultSetId = $(event.target).data('warpjsResultSet');
                                const relatedResultSet = _.find(result.data._embedded.questionnaires[0]._embedded.resultSets, (resultSet) => {
                                    return resultSet.id === resultSetId;
                                });

                                readMoreSetup(resultSetId, relatedResultSet);
                            });

                            $(document).on('click', '.related-all-read-more', (event) => {
                                getAssessment();
                                $('.progress-container, .blue-button-container').css('display', 'none');
                                const resultSetId = $('.related-all').data('warpjsResultsetId');
                                const relatedResultSet = _.find(result.data._embedded.questionnaires[0]._embedded.resultSets, (resultSet) => {
                                    return resultSet.id === resultSetId;
                                });
                                const clickedResultId = $(event.target).data('warpjsResult');
                                const clickedResult = _.find(relatedResultSet._embedded.results, (result) => {
                                    return result.id === clickedResultId;
                                });

                                relatedResultSet.recommendation = clickedResult;

                                readMoreSetup(resultSetId, relatedResultSet);
                            });

                            $(document).on('click', '.related-details-back', () => {
                                $('.progress-container, .blue-button-container').css('display', 'block');
                                relatedReadingSetup();
                            });

                            $(document).on('click', '.progress-bar-container', (event) => {
                                if (result.data.assessmentId) {
                                    const progressBar = $('.progress-bar-container');
                                    const progressWidth = progressBar.innerWidth();
                                    const offset_l = progressBar.offset().left - $(window).scrollLeft();
                                    const left = Math.round((event.clientX - offset_l));
                                    const progressPercent = Math.round((left / progressWidth) * 100);
                                    const selectedCategoryIndex = (Math.ceil((progressPercent / 100) * progressFilteredCategories.length) - 1);

                                    if ($('.questionnaire.question').length) {
                                        getAssessment();
                                        updateQuestions();
                                        updateAssessment();
                                    } else if ($('.questionnaire.description').length) {
                                        if ($('#project-name').val()) {
                                            getAssessment();
                                            assessment.projectName = $('#project-name').val();
                                            assessment.mainContact = $('#main-contact').val();
                                            assessment.projectStatus = $('#project-status').val();
                                            updateAssessment();
                                            $('.ipt-title').html(assessment.projectName);
                                        } else {
                                            $('#project-name').addClass('is-invalid');
                                            $('.invalid-feedback').css('display', 'block');
                                            return;
                                        }
                                    } else if ($('.questionnaire.levels').length) {
                                        levelsOnLeave();
                                    } else if ($('.questionnaire.iterations').length) {
                                        let hasIteration = false;
                                        $('.iteration-form input[type="text"]').each((index, element) => {
                                            if ($(element).val()) {
                                                hasIteration = true;
                                            }
                                        });
                                        if (hasIteration) {
                                            getAssessment();
                                            updateIterations();
                                            updateAssessment();
                                        } else {
                                            $('.iteration-form input[type="text"]').first().addClass('is-invalid');
                                            $('.invalid-feedback').css('display', 'block');
                                            return;
                                        }
                                    }

                                    if (progressFilteredCategories[selectedCategoryIndex] === 'results') {
                                        categoryPointer = categories.length - 1;
                                        iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                            return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                        });
                                        iterationPointer = iterations.length - 1;
                                        questions = iterations.length ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                            return isMM ? parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : question.detailLevel <= assessment.detailLevel;
                                        }) : [];
                                        questionPointer = questions.length ? questions.length - 1 : -1;

                                        updatePointers('next');
                                    } else {
                                        categoryPointer = _.findIndex(categories, (o) => {
                                            return o.id && o.id === progressFilteredCategories[selectedCategoryIndex].id;
                                        });
                                        iterationPointer = 0;
                                        questionPointer = 0;
                                        iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                            return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                        });
                                        questions = iterations.length > 0 ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                            return isMM ? parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10) : question.detailLevel <= assessment.detailLevel;
                                        }) : [];

                                        if (categories[categoryPointer].isRepeatable) {
                                            questionPointer = -1;
                                        }

                                        updateQuestionContent('');
                                    }
                                }
                            });

                            $(document).on('change keyup paste', '.comment-text', (event) => {
                                if ($(event.target).val().length) {
                                    $('.comments').addClass('has-comments');
                                } else {
                                    $('.comments.has-comments').removeClass('has-comments');
                                }
                            });

                            $(document).on('keypress', (event) => {
                                if ($('.questionnaire.question .option-container').length) {
                                    if (event.which === 49) {
                                        $('.questionnaire.question .option-container:nth-child(1)').find('a.radio-fx').click();
                                        $('.question-next').click();
                                    } else if (event.which === 50) {
                                        $('.questionnaire.question .option-container:nth-child(2)').find('a.radio-fx').click();
                                        $('.question-next').click();
                                    } else if (event.which === 51) {
                                        $('.questionnaire.question .option-container:nth-child(3)').find('a.radio-fx').click();
                                        $('.question-next').click();
                                    } else if (event.which === 52) {
                                        $('.questionnaire.question .option-container:nth-child(4)').find('a.radio-fx').click();
                                        $('.question-next').click();
                                    } else if (event.which === 53 && $('.questionnaire.question .option-container').length > 4) {
                                        $('.questionnaire.question .option-container:nth-child(5)').find('a.radio-fx').click();
                                        $('.question-next').click();
                                    } else if (event.which === 48) {
                                        $('.questionnaire.question .radio-checked').parent().click();
                                        $('.question-next').click();
                                    }
                                }
                            });

                            $(document).on('click', '.save-warning-continue', () => {
                                window.location = $('.content-link').data('url');
                            });

                            $(document).on('click', '.save-warning-new-tab', () => {
                                window.open($('.content-link').data('url'), '_blank');
                            });

                            $(document).on('click', '.related-question-feedback-button, .result-feedback-button', (event) => {
                                const element = $(event.target).closest('.related-question-feedback-button-container, .result-feedback-button-container');
                                const questionId = element.data('warpjsQuestionId');
                                const answerName = element.data('warpjsQuestionAnswerName');
                                const answerNum = element.data('warpjsQuestionAnswer');
                                const questionName = element.data('warpjsQuestionName');
                                const submitUrl = element.data('warpjsSubmitUrl');
                                const thumbClicked = $(event.currentTarget).hasClass('thumbs-up') ? 'thumbs-up' : 'thumbs-down';
                                const resultsetId = $('.related-reading-details').length ? $('.related-reading-details').data('warpjsResultsetId') : element.data('warpjsResultsetId');
                                const resultId = $('.related-reading-details').length ? $('.related-reading-details').data('warpjsResultId') : element.data('warpjsResultId');
                                const feedbackType = element.data('warpjsFeedbackType');
                                const resultName = $('.related-details-result-name').data('warpjsResultName');
                                openRelatedFeedbackModal($, questionId, answerName, answerNum, questionName, submitUrl, resultsetId, resultId, feedbackType, null, thumbClicked, resultName);
                            });

                            $(document).on('click', '#survey-tool-feedback-button', (event) => {
                                const element = $(event.target).closest('#survey-tool-feedback-button');
                                const submitUrl = element.data('warpjsSubmitUrl');
                                const feedbackType = 'survey';
                                openRelatedFeedbackModal($, null, null, null, null, submitUrl, null, null, feedbackType, null, null);
                            });

                            $(document).on('click', '#survey-question-feedback-button', (event) => {
                                const element = $(event.target).closest('#survey-question-feedback-button');
                                const submitUrl = element.data('warpjsSubmitUrl');
                                const questionId = element.data('warpjsQuestionId');
                                const questionName = element.data('warpjsQuestionName');
                                const iterationName = element.data('warpjsIterationName=');
                                const feedbackType = element.data('warpjsFeedbackType');
                                openRelatedFeedbackModal($, questionId, null, null, questionName, submitUrl, null, null, feedbackType, iterationName, null);
                            });

                            $(document).on('click', '.email-submit', (event) => {
                                const data = {
                                    fullName: $("input#name").val(),
                                    email: $("input#email").val(),
                                    questionnaireId: result.data.surveyId
                                };

                                if (data.fullName || data.email) {
                                    Promise.resolve()
                                        .then(() => window.WarpJS.toast.loading($, "Loading data...", "Loading"))
                                        .then((toastLoading) => Promise.resolve()
                                            .then(() => window.WarpJS.proxy.post($, result.data._links.submitEmail.href, data))
                                            .then((res) => {
                                                window.WarpJS.toast.success($, "Saved successfully.");
                                                $("input#name").val('');
                                                $("input#email").val('');
                                            })
                                            .catch((err) => {
                                                console.error("Error:", err);
                                                window.WarpJS.toast.error($, err.message, "Error getting data");
                                            })
                                            .finally(() => window.WarpJS.toast.close($, toastLoading))
                                        )
                                    ;
                                }
                            });
                        })
                    ;
                }
            }
        })
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
