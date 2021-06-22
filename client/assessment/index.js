const _ = require('lodash');
const Promise = require('bluebird');
const { v4: uuid } = require('uuid');

const { NAVIGATION } = require('./../constants');
const track = require('./../track');
const utils = require('./../utils');

const cannotFindAssessmentTemplate = require('./cannot-find-assessment.hbs');
const constants = require('./../constants');
const createImageMapElements = require('./resources/create-image-map-elements.js');
const emailFormTemplate = require('./results/email-form-template.hbs');
const errorTemplate = require('./../error.hbs');
const getVersion = require('./get-version');
const mockWarpjsUtils = require('./../mock-warpjs-utils');
const openRelatedFeedbackModal = require('./feedback/open-related-feedback-modal.js');
const projectDescription = require('./project-description');
const Questionnaire = require('./../../lib/models/questionnaire');
const questionnaireTemplate = require('./questionnaire.hbs');
const questionnaireIntroTemplate = require('./questionnaire-intro.hbs');
const questionnaireLevelsTemplate = require('./questionnaire-levels.hbs');
const questionnaireModulesTemplate = require('./questionnaire-modules.hbs');
const questionnaireModuleDetailsTemplate = require('./questionnaire-module-details.hbs');
const questionnairePersonasTemplate = require('./questionnaire-personas.hbs');
const questionnaireIterationTemplate = require('./questionnaire-iterations.hbs');
const questionnaireSummaryTemplate = require('./results/questionnaire-summary.hbs');
const questionnaireDetailsTemplate = require('./results/questionnaire-details.hbs');
const questionnaireSubDetailsTemplate = require('./results/questionnaire-sub-details.hbs');
const questionnaireRelatedReadingTemplate = require('./results/questionnaire-related-readings.hbs');
const questionnaireRelatedDetailsTemplate = require('./results/questionnaire-related-reading-detail.hbs');
const questionnaireRelatedAllTemplate = require('./results/questionnaire-related-all.hbs');
const shared = require('./../shared');
const spiderDiagram = require('./spider-diagram.js');
const storage = require('./../storage');
const styleRadio = require('./resources/style-radio');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);
    $('.progress-container, .details-button-container', placeholder).css('display', 'block');
    $('.progress-results-button, .spider-button', placeholder).css('display', 'inline-block');
    $('.spider-button[data-toggle="tooltip"]', placeholder).tooltip();
    $('.copyright[data-toggle="tooltip"], .copyright-mm[data-toggle="tooltip"]', placeholder).tooltip({
        container: 'body',
        trigger: 'click'
    });

    return Promise.resolve()
        .then(() => window.WarpJS.getCurrentPageHAL($))
        .then((result) => {
            storage.setCurrent($, storage.KEYS.DEFAULT_ANSWERS, result.data._embedded.answers[0]);
            storage.setCurrent($, storage.KEYS.CUSTOM_MESSAGES, result.data._embedded[storage.KEYS.CUSTOM_MESSAGES]);
            if (result.data && result.data._embedded && result.data._embedded.questionnaires) {
                storage.setCurrent($, storage.KEYS.QUESTIONNAIRES, result.data._embedded.questionnaires.reduce(
                    (cumulator, questionnaire) => {
                        cumulator[questionnaire.id] = Questionnaire.fromHal(questionnaire);
                        return cumulator;
                    },
                    {}
                ));
            }

            const isMM = utils.isMM(result.data._embedded.questionnaires[0].key);

            if (result.error) {
                shared.setSurveyContent($, placeholder, errorTemplate(result.data));
            } else {
                shared.postRender($, result.data);

                let categoryPointer = 0;
                let iterationPointer = 0;
                let questionPointer = 0;
                let progress = 0;
                let assessment;

                $(document).on('click', '.copyright, .copyright-mm', (event) => {
                    track('click', `Copyright`);
                });

                if (result.data.assessmentId) {
                    assessment = storage.getAssessment(result.data.surveyId, result.data.assessmentId);
                    if (assessment) {
                        questionPointer = 2;
                        storage.setCurrent($, storage.KEYS.SURVEY_ID, result.data.surveyId);
                        storage.setCurrent($, storage.KEYS.ASSESSMENT_ID, result.data.assessmentId);
                    } else {
                        shared.setSurveyContent($, placeholder, cannotFindAssessmentTemplate({ assessmentId: result.data.assessmentId }));
                        return;
                    }

                    $('.survey-tool').addClass('active-nav-buttons');
                } else {
                    storage.setCurrent($, storage.KEYS.SURVEY_ID, result.data.surveyId);
                    const questionnaire = storage.getCurrent($, storage.KEYS.QUESTIONNAIRES)[storage.getCurrent($, storage.KEYS.SURVEY_ID)];
                    assessment = questionnaire.generateDefaultAssessment(uuid, 'foobar').toHal(mockWarpjsUtils).toJSON();
                    assessment.answers = assessment._embedded.answers;
                    delete assessment._embedded.answers;
                }

                let categories = [];
                let iterations = [];
                let questions = [];

                const intro = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (qCategory) => {
                    return qCategory.name === "Introduction";
                });
                const categoriesMinusIntro = _.reject(result.data._embedded.questionnaires[0]._embedded.categories, { id: intro.id });

                const questionInSelection = (question) => {
                    let isMatch = true;

                    if (isMM) {
                        isMatch = parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10);
                    }

                    return isMatch;
                };

                const getIterations = (categories) => {
                    return categories[categoryPointer]
                        ? _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                            return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                        })
                        : [];
                };

                const getCategories = (categories) => {
                    let filteredCategories = [];
                    if (isMM) {
                        filteredCategories = _.filter(categories, (progressCategory) => {
                            const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                                return questionInSelection(progressQuestion);
                            });

                            return questionDetailLevels.length > 0;
                        });
                    } else {
                        filteredCategories = _.filter(categories, (progressCategory) => {
                            return (assessment.modules && assessment.modules.indexOf(progressCategory.id) > -1) || (progressCategory.id === intro.id);
                        });
                    }

                    return filteredCategories;
                };

                const getQuestions = (iterations) => {
                    return iterations.length
                        ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                            return questionInSelection(question);
                        })
                        : [];
                };

                const calculatePriority = (priorityValue) => {
                    return isNaN(parseInt(priorityValue, 10)) ? 2 : parseInt(priorityValue, 10);
                };

                const filterContent = () => {
                    categories = getCategories(assessment.answers[0]._embedded.categories);
                    iterations = getIterations(categories);
                    questions = getQuestions(iterations);
                };

                filterContent();
                progress = 0;

                const getAssessment = () => {
                    assessment = storage.getAssessment(storage.getCurrent($, storage.KEYS.SURVEY_ID), storage.getCurrent($, storage.KEYS.ASSESSMENT_ID));
                    filterContent();
                };

                const updateAssessment = () => {
                    storage.updateAssessment(storage.getCurrent($, storage.KEYS.SURVEY_ID), storage.getCurrent($, storage.KEYS.ASSESSMENT_ID), assessment);
                };

                let progressFilteredCategories = [];

                const updateProgressTotal = () => {
                    progressFilteredCategories = _.cloneDeep(categories);
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

                            const assignModulesSelected = () => {
                                _.each(categories, (categoryModule) => {
                                    $(".modules input[value='" + categoryModule.id + "']").attr('checked', 'checked');
                                });
                            };

                            const assignPersonaSelected = () => {
                                const persona = assessment.persona !== '' ? assessment.persona : '';
                                $("input[name='questionnaire-persona'][value='" + persona + "']").attr('checked', 'checked');
                            };

                            const feedbackUrl = result.data._links.submitFeedback.href;

                            $('.ipt-title').html(assessment.projectName);
                            const version = getVersion(assessment);
                            $('.ipt-version').html(version);

                            const levelsOnLeave = () => {
                                getAssessment();
                                assessment.detailLevel = $("input[name='questionnaire-level'][checked='checked']").val();
                                categories = getCategories(assessment.answers[0]._embedded.categories);
                                updateProgressTotal();
                                updateAssessment();
                            };

                            const personasOnLeave = () => {
                                getAssessment();
                                const newPersona = $("input[name='questionnaire-persona'][checked='checked']").val();
                                if ((!assessment.persona && !newPersona) || (assessment.persona && assessment.persona === newPersona)) {
                                    return;
                                }

                                assessment.persona = newPersona;
                                assessment.modules = [];

                                _.each(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                    const personaMatch = _.filter(category._embedded.personas, (persona) => {
                                        return persona.id === assessment.persona;
                                    });

                                    if (personaMatch.length > 0) {
                                        assessment.modules.push(category.id);
                                    }
                                });

                                categories = getCategories(assessment.answers[0]._embedded.categories);
                                updateProgressTotal();
                                updateAssessment();
                            };

                            const modulesOnLeave = () => {
                                getAssessment();
                                assessment.modules = [];
                                _.each($('.modules input:checked'), (module) => {
                                    assessment.modules.push($(module).val());
                                });

                                categories = getCategories(assessment.answers[0]._embedded.categories);
                                updateProgressTotal();
                                updateAssessment();
                            };

                            $(document).on('click', '.description-back, .description-next', (event) => {
                                const direction = $(event.target).hasClass('description-back') ? 'back' : 'next';
                                // track(direction, categoryPointer, iterationPointer, questionPointer, progress, 'description');

                                if ($('#project-name').val() || $(event.target).hasClass('description-back')) {
                                    if (result.data.assessmentId) {
                                        getAssessment();
                                    }
                                    assessment.projectName = $('#project-name').val();
                                    assessment.mainContact = $('#main-contact').val();
                                    assessment.projectStatus = $('#project-status').val();
                                    track(direction, `Project Description: ${assessment.projectName || '<no name>'} // ${assessment.mainContact || '<no contact>'} // ${assessment.projectStatus || '<no status>'}`);
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
                                const detailLevel = $("input[name='questionnaire-level'][checked='checked']").val();
                                track('next-or-back', `Level: ${detailLevel}`);
                                levelsOnLeave();
                            });

                            $(document).on('click', '.personas-back, .personas-next', () => {
                                personasOnLeave();
                            });

                            $(document).on('click', '.modules-back, .modules-next', () => {
                                modulesOnLeave();
                            });

                            const updatePointers = (direction) => {
                                categories = getCategories(assessment.answers[0]._embedded.categories);
                                iterations = categories[categoryPointer]
                                    ? _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                        return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                    })
                                    : [];
                                questions = getQuestions(iterations);
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

                                                questions = getQuestions(iterations);
                                                if (categories[categoryPointer] && categories[categoryPointer].isRepeatable) {
                                                    questionPointer = -1;
                                                }
                                            }
                                        } else {
                                            iterationPointer += 1;
                                            questionPointer = 0;

                                            questions = getQuestions(iterations);
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
                                                questions = getQuestions(iterations);
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

                                updateQuestionContent(outOfBounds, direction);
                            };

                            const assignOptionSelected = (qQuestion, aQuestion) => {
                                if (typeof qQuestion !== 'undefined' && typeof aQuestion !== 'undefined') {
                                    const option = _.find(qQuestion._embedded.options, (option) => {
                                        return option.id === aQuestion.answer;
                                    });
                                    if (typeof option !== 'undefined') {
                                        option.isSelected = true;
                                    }
                                }
                                return qQuestion;
                            };

                            const templateValues = () => {
                                const currentCategory = categories[categoryPointer]
                                    ? _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                        return category.id === categories[categoryPointer].id;
                                    })
                                    : null;
                                currentCategory.comments = categories[categoryPointer].comments;
                                const currentQuestion = questions[questionPointer]
                                    ? _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                        return question.id === questions[questionPointer].id;
                                    }))
                                    : null;
                                const updatedQuestion = assignOptionSelected(currentQuestion, questions[questionPointer]);
                                if (updatedQuestion) {
                                    updatedQuestion.comments = questions[questionPointer].comments;
                                    updatedQuestion.priority = questions[questionPointer].priority;
                                }
                                const values = { category: currentCategory, question: updatedQuestion };
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
                                    // eslint-disable-next-line no-empty
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

                                const currentImageArea = imageArea
                                    ? _.find(currentImglib && currentImglib._embedded.images ? currentImglib._embedded.images[0]._embedded.imageMaps : null, (imageMap) => {
                                        return imageMap && imageMap.title === imageArea;
                                    })
                                    : null;
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
                                const currentCategory = categories[categoryPointer]
                                    ? _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                        return category.id === categories[categoryPointer].id;
                                    })
                                    : null;
                                const currentQuestion = questions[questionPointer]
                                    ? _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                        return question.id === questions[questionPointer].id;
                                    }))
                                    : null;
                                const values = { category: currentCategory, question: currentQuestion };
                                if (questionPointer) {
                                    values.notFirst = true;
                                }

                                if (currentQuestion && currentQuestion.imageUrl) {
                                    values.image = currentQuestion.imageUrl;
                                }

                                return values;
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
                                                const questionQ = question
                                                    ? _.find(categoryQ._embedded.questions, (questionQuestion) => {
                                                        return questionQuestion.id === question.id;
                                                    })
                                                    : null;
                                                const option = questionQ
                                                    ? _.find(questionQ._embedded.options, (option) => {
                                                        return option.id === question.answer;
                                                    })
                                                    : null;
                                                position = option ? option.position : null;

                                                const priority = calculatePriority(question.priority);
                                                const positionNumber = parseInt(position);
                                                const positions = [];
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
                                const numberOfSections = utils.isMM(key) ? 5 : 4;
                                const offsetConstant = utils.isMM(key) ? 10 : 12.5;

                                $('.marker').each((index, element) => {
                                    const score = $(element).data('score');
                                    const offset = (score - 1) / numberOfSections * 100 + offsetConstant;
                                    const colorScore = Math.round(score);
                                    let color = '#de2a2d';
                                    if ((colorScore <= 2 && numberOfSections === 4) || ((colorScore === 5 || colorScore === 4) && numberOfSections === 5)) {
                                        color = '#7eba41';
                                    } else if (colorScore === 3 && numberOfSections === 4) {
                                        color = '#fcb830';
                                    } else if (colorScore === 3 && numberOfSections === 5) {
                                        color = '#949494';
                                    } else if (colorScore === 2 && numberOfSections === 5) {
                                        color = '#fcb830';
                                    } else if (colorScore === 1 && numberOfSections === 5) {
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
                                return _.filter(_.map(getCategories(assessment.answers[0]._embedded.categories), (category) => {
                                    const categoryQ = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (questionCategory) => {
                                        return questionCategory.id === category.id;
                                    });
                                    const answersList = _.map(category._embedded.iterations, (iteration) => {
                                        const iterationQ = _.map(iteration._embedded.questions, (question) => {
                                            if ((isMM && parseInt(question.detailLevel, 10) === parseInt(assessment.detailLevel, 10)) || !isMM) {
                                                const questionQ = question
                                                    ? _.find(categoryQ._embedded.questions, (questionQuestion) => {
                                                        return questionQuestion.id === question.id;
                                                    })
                                                    : null;
                                                const option = questionQ
                                                    ? _.find(questionQ._embedded.options, (option) => {
                                                        return option.id === question.answer;
                                                    })
                                                    : null;
                                                const selectedOption = questionQ && questionQ._embedded.options.length && option ? option.position : null;
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

                                                const allStatuses = questionQ && questionQ._embedded.options
                                                    ? _.map(questionQ._embedded.options, (optionQ) => {
                                                        return {
                                                            currentStatus: optionQ.currentStatus,
                                                            isSelected: optionQ.id === question.answer
                                                        };
                                                    })
                                                    : null;

                                                return {
                                                    name: questionQ ? questionQ.name : null,
                                                    hasOptions: !!questionQ && questionQ._embedded.options.length,
                                                    position: selectedOption,
                                                    option: questionQ && questionQ._embedded.options.length && option ? option : null,
                                                    comments: question.comments,
                                                    priority: priority,
                                                    moreInformation: questionQ ? questionQ.moreInformation : null,
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

                            const spiderSetup = (type) => {
                                getAssessment();

                                const goToQuestion = (questionIndex, iterationIndex, categoryIndex, type) => {
                                    categoryPointer = categoryIndex;
                                    iterationPointer = iterationIndex;
                                    questionPointer = questionIndex;

                                    if (type === 'question') {
                                        updatePointers('next');
                                    }

                                    updatePointers('back');
                                    updateAssessment();
                                };

                                spiderDiagram($, isMM, result.data._embedded.questionnaires[0], getCategories(result.data._embedded.questionnaires[0]._embedded.categories), 'svg.spider.' + type + '-spider', type, assessment.answers[0], assessment.detailLevel, goToQuestion);
                            };

                            const updateQuestionContent = (outOfBounds = '', direction = null) => {
                                const progressPosition = categories[categoryPointer]
                                    ? _.findIndex(progressFilteredCategories, function(o) {
                                        return o.id && o.id === categories[categoryPointer].id;
                                    })
                                    : null;
                                progress = (progressPosition) / progressFilteredCategories.length * 100;
                                const currentCategory = categories[categoryPointer]
                                    ? _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                        return category.id === categories[categoryPointer].id;
                                    })
                                    : null;

                                if (outOfBounds !== '') {
                                    // eslint-disable-next-line no-empty
                                    if (outOfBounds === 'front') {

                                    } else if (outOfBounds === 'end') {
                                        progress = 100;
                                        summarySetup();
                                    }
                                } else if (questionPointer === -1) {
                                    const values = templateValues();
                                    shared.setSurveyContent($, placeholder, questionnaireIterationTemplate({ category: values.category, iterations: categories[categoryPointer]._embedded.iterations, image: values.image }));
                                    if (values.imageMap) {
                                        createImageMapElements($, values.imageMap);
                                    }
                                } else {
                                    if (currentCategory && currentCategory.name === constants.specializedTemplates.introCategory) {
                                        const currentQuestion = questions[questionPointer]
                                            ? _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                                return question.id === questions[questionPointer].id;
                                            }))
                                            : null;
                                        if (currentQuestion && currentQuestion.name === constants.specializedTemplates.description) {
                                            const questionnaire = _.find(result.data._embedded.questionnaires, [ 'id', result.data.surveyId ]);
                                            const questionnaireUrl = questionnaire ? questionnaire._links.self.href : '';
                                            projectDescription($, placeholder, assessment, currentQuestion, questionnaireUrl, result.data._embedded.questionnaires[0].key, result.data._embedded.questionnaires[0].hasSampleProject);
                                        } else if (currentQuestion && currentQuestion.name === constants.specializedTemplates.details) {
                                            shared.setSurveyContent($, placeholder, questionnaireLevelsTemplate({ level: assessment.detailLevel, question: currentQuestion, detailedEnabled: result.data.warpjsUser !== null && result.data.warpjsUser.UserName !== null }));
                                            assignDetailLevelSelected();
                                        } else if (currentQuestion && currentQuestion.name === constants.specializedTemplates.spider) {
                                            spiderSetup('intro');
                                        } else if (currentQuestion && currentQuestion.name === constants.specializedTemplates.personas) {
                                            if (result.data._embedded.questionnaires[0]._embedded.personas && result.data._embedded.questionnaires[0]._embedded.personas.length) {
                                                shared.setSurveyContent($, placeholder, questionnairePersonasTemplate({ personas: _.orderBy(result.data._embedded.questionnaires[0]._embedded.personas, [ 'position' ], [ 'asc' ]), question: currentQuestion, detailedEnabled: result.data.warpjsUser !== null && result.data.warpjsUser.UserName !== null }));
                                                assignPersonaSelected();
                                                $('[data-toggle="tooltip"]').tooltip({
                                                    container: 'body'
                                                });
                                            } else if (direction) {
                                                updatePointers(direction);
                                            }
                                        } else if (currentQuestion && currentQuestion.name === constants.specializedTemplates.modules) {
                                            _.each(categoriesMinusIntro, (category) => {
                                                category.showDetails = !!category.modularDetailsContent || !!category.modularDetailsName;
                                            });

                                            const sections = _.groupBy(categoriesMinusIntro, (category) => {
                                                return category.section === undefined ? '' : category.section;
                                            });

                                            shared.setSurveyContent($, placeholder, questionnaireModulesTemplate({ sections: sections, question: currentQuestion }));
                                            assignModulesSelected();
                                        } else {
                                            shared.setSurveyContent($, placeholder, questionnaireIntroTemplate(introTemplateValues()));
                                        }
                                    } else {
                                        const values = templateValues();
                                        shared.setSurveyContent($, placeholder, questionnaireTemplate(values));
                                        if (values.imageMap) {
                                            createImageMapElements($, values.imageMap);
                                        }

                                        $('.image-map-img-container > img').css({ width: values.imageWidth ? values.imageWidth : 'auto', height: values.imageHeight ? values.imageHeight : 'auto' });
                                    }
                                }

                                $('.survey-tool .progress-bar').css('width', progress + '%');
                                styleRadio($);
                            };

                            const updateIterations = () => {
                                const category = categories[categoryPointer];
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
                                    let hasAnswer = false;
                                    const paddingAmount = $(this).innerWidth() - $(this).find('.blue-card').outerWidth(true);
                                    const containerWidth = $(this).find('.blue-card').length * ($(this).find('.blue-card').outerWidth(true) + 3) + $(this).find('.status-arrow').length * ($(this).find('.status-arrow').outerWidth(true) + 4) + paddingAmount;
                                    $(this).css('width', containerWidth);
                                    if ($('.detail-question-status-container').find('.current-status').length && $(this).find('.current-status').position()) {
                                        const scrollDistance = $(this).find('.current-status').position().left - (paddingAmount / 2);
                                        $(this).closest('.detail-status-cutoff').scrollLeft(scrollDistance);
                                        hasAnswer = true;
                                    }

                                    if (!hasAnswer) {
                                        $(this).addClass('not-answered');
                                    }
                                });

                                $('[data-toggle="tooltip"]').tooltip({
                                    container: 'body'
                                });
                            };

                            const subDetailsSetup = () => {
                                const details = {
                                    questionnaire: result.data._embedded.questionnaires[0].name,
                                    name: assessment.projectName,
                                    contact: assessment.mainContact,
                                    status: assessment.projectStatus,
                                    data: detailsValues()
                                };
                                const values = summaryValues();
                                shared.setSurveyContent($, placeholder, questionnaireSubDetailsTemplate({
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

                                $('.has-comments').append('<a class="has-comments-after" data-toggle="modal" data-target="#comments-modal"></a>');
                                $(document).on('click', '.has-comments-after', (event) => {
                                    const comment = $(event.target).parent().data('comments');
                                    $('.comment-text').css('display', 'none');
                                    $('.comment-text-not-editable').css('display', 'block');
                                    $('.comment-text-not-editable').html(comment);
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
                                                const questionCategory = rCategory
                                                    ? _.find(result.data._embedded.questionnaires[0]._embedded.categories, (qCategory) => {
                                                        return qCategory.id === rCategory.id;
                                                    })
                                                    : null;
                                                const questionQuestion = questionCategory
                                                    ? _.find(questionCategory._embedded.questions, (qQuestion) => {
                                                        return qQuestion.id === rQuestion.id;
                                                    })
                                                    : null;
                                                numberOfOptions = Math.max(numberOfOptions, questionQuestion._embedded.options.length);
                                                const questionAnswer = questionQuestion
                                                    ? _.find(questionQuestion._embedded.options, (qOption) => {
                                                        return qOption.id === rQuestion.answer;
                                                    })
                                                    : null;
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
                                        result.numberAnswered = 0;
                                        _.each(result._embedded.relevantQuestions, (relevantQuestion) => {
                                            _.each(relevantQuestion
                                                ? _.filter(flattenedAnswers, (aQuestion) => {
                                                    return aQuestion.id === relevantQuestion.id;
                                                })
                                                : null, (aQuestion) => {
                                                if (relevantQuestion.relevance === 'high') {
                                                    result.points += Math.max(0, parseInt(aQuestion.answer, 10) - weightAdjustment);
                                                    result.numberAnswered += 1;
                                                } else if (relevantQuestion.relevance === 'low') {
                                                    result.points += Math.max(0, (5 - parseInt(aQuestion.answer, 10)) - weightAdjustment);
                                                    result.numberAnswered += 1;
                                                }
                                            });
                                        });

                                        result.points = result.numberAnswered > 0 ? result.points / result.numberAnswered : 0;
                                        const unroundedStars = result.points / Math.floor(numberOfOptions / 2) * 5;
                                        // since stars are rounded up, mod === 0 means it should be a full star.
                                        result.starRemainder = unroundedStars % 1 === 0 ? 2 : Math.round((unroundedStars % 1) * 2);
                                        result.stars = Math.ceil(unroundedStars);
                                        result.textRank = Math.max(Math.round(unroundedStars), 1);
                                    });

                                    resultSet.orderedRecommendations = _.orderBy(_.filter(resultSet._embedded.results, (result) => {
                                        return result.points > 0;
                                    }), [ 'points' ], [ 'desc' ]);

                                    const recommendation = _.orderBy(_.filter(resultSet._embedded.results, (result) => {
                                        return result.points > 0;
                                    }), [ 'points' ], [ 'desc' ])[0];

                                    const existingFeedback = _.find(assessment.resultsetFeedback, (feedback) => {
                                        return feedback.resultsetId === resultSet.id && feedback.resultId === recommendation.id && feedback.feedbackType === 'result';
                                    });

                                    if (existingFeedback) {
                                        recommendation.thumbValue = existingFeedback.thumbValue.toLowerCase();
                                    }

                                    resultSet.recommendation = recommendation;
                                    resultSet.recommendationName = recommendation ? recommendation.name : null;
                                });
                                shared.setSurveyContent($, placeholder, questionnaireRelatedReadingTemplate({ readings: result.data._embedded.questionnaires[0]._embedded.resultSets, feedbackUrl: feedbackUrl }));

                                $('.star-container[data-toggle="tooltip"]', placeholder).tooltip({ html: true });
                            };

                            if (assessment.answers[0]._embedded.categories[categoryPointer].isRepeatable === true) {
                                questionPointer = -1;
                            }

                            categories = assessment.answers[0]._embedded.categories;
                            iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                            });
                            questions = getQuestions(iterations);

                            updateQuestionContent();

                            $(document).on('click', '.warpjs-home-link', () => {
                                track('home', `Question: Category=${categoryPointer} - Question=${questionPointer}`);
                            });

                            $(document).on('submit', '.word-download-form', () => {
                                track('download', `Summary: Download Draft RFP`);
                            });

                            $(document).on('click', 'input[name="questionnaire-level"] + a', (event) => {
                                const checked = $(event.currentTarget).siblings('input').attr('checked') === 'checked';
                                const value = $(event.currentTarget).siblings('input').val();
                                track('select-level-details', `Level Details: ${value}/${checked}`);
                            });

                            $(document).on('click', 'input[name="questionnaire-persona"] + a', (event) => {
                                const checked = $(event.currentTarget).siblings('input').attr('checked') === 'checked';
                                const label = $(event.currentTarget).siblings('h3').text();
                                track('select-persona', `Persona: ${label} (checked:${checked})`);
                            });

                            $(document).on('click', '.modules .module-container input[type="checkbox"] + a', (event) => {
                                const checked = $(event.currentTarget).siblings('input').attr('checked') === 'checked';
                                const label = $(event.currentTarget).siblings('input').attr('name');
                                track('select-module', `Module: ${label} (checked:${checked})`);
                            });

                            $(document).on('click', '.question-next', () => {
                                track(NAVIGATION.NEXT, `Question: Category=${categoryPointer} - Question=${questionPointer}`);
                                getAssessment();
                                updateQuestions();
                                updatePointers('next');
                                updateAssessment();
                            });
                            $(document).on('click', '.question-back', () => {
                                track(NAVIGATION.BACK, `Question: Category=${categoryPointer} - Question=${questionPointer}`);
                                getAssessment();
                                updateQuestions();
                                updatePointers('back');
                                updateAssessment();
                            });
                            $(document).on('click', '.question-next-intro, .question-back-intro', (event) => {
                                const direction = $(event.target).hasClass('question-back-intro') ? 'back' : 'next';
                                track(direction, `Question-intro: Category=${categoryPointer} - Question=${questionPointer}`);
                                updatePointers(direction);
                            });
                            $(document).on('click', '.iteration-next', () => {
                                track(NAVIGATION.NEXT, `Iteration: Category=${categoryPointer} - Question=${questionPointer}`);
                                iterationClick('next');
                            });
                            $(document).on('click', '.iteration-back', () => {
                                track(NAVIGATION.BACK, `Iteration: Category=${categoryPointer} - Question=${questionPointer}`);
                                iterationClick('back');
                            });
                            $(document).on('click', '.summary-back', () => {
                                track(NAVIGATION.BACK, `Back from Summary`);
                                updateQuestionContent();
                            });
                            $(document).on('click', '.details-next, .email-back-to-related', () => {
                                track('next-or-back', `Guidance`);
                                relatedReadingSetup();
                            });
                            $(document).on('click', '.details-back, .sub-details-back', () => {
                                track('next-or-back', `Summary`);
                                summarySetup();
                            });
                            $(document).on('click', '.summary-next, .sub-summary-next, .related-reading-back, .email-back-to-details', () => {
                                track('next-or-back', `Details`);
                                detailsSetup();
                            });
                            $(document).on('click', '.mm-summary-next, .mm-details-back', () => {
                                track('next-or-back', `Overview`);
                                subDetailsSetup();
                            });
                            $(document).on('click', '.next-to-email-form', () => {
                                shared.setSurveyContent($, placeholder, emailFormTemplate());
                                track(NAVIGATION.NEXT, 'Stay in touch');
                            });

                            $(document).on('click', '.progress-results-button', (event) => {
                                if (result.data.assessmentId) {
                                    const $clicked = $(event.target);
                                    categoryPointer = categories.length - 1;
                                    iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                        return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                    });
                                    iterationPointer = iterations.length - 1;
                                    questions = getQuestions(iterations);
                                    questionPointer = questions.length ? questions.length - 1 : -1;

                                    if (isMM) {
                                        switch ($clicked.data('result')) {
                                            case 1:
                                                track('progress', `Summary`);
                                                summarySetup();
                                                break;
                                            case 2:
                                                track('progress', `Overview`);
                                                subDetailsSetup();
                                                break;
                                            case 3:
                                                track('progress', `Details`);
                                                detailsSetup();
                                        }
                                    } else {
                                        switch ($clicked.data('result')) {
                                            case 1:
                                                track('progress', `Summary`);
                                                summarySetup();
                                                break;
                                            case 2:
                                                track('progress', `Details`);
                                                detailsSetup();
                                                break;
                                            case 3:
                                                track('progress', `Guidance`);
                                                relatedReadingSetup();
                                        }
                                    }

                                    $('.survey-tool .progress-bar').css('width', '100%');
                                }
                            });

                            $(document).on('click', '.show-related-all', (event) => {
                                const resultSetId = $(event.target).data('warpjsResultSet');
                                const relatedResultSet = _.find(result.data._embedded.questionnaires[0]._embedded.resultSets, (resultSet) => {
                                    return resultSet.id === resultSetId;
                                });

                                shared.setSurveyContent($, placeholder, questionnaireRelatedAllTemplate({ resultSet: relatedResultSet, orderedRecommendations: relatedResultSet.orderedRecommendations }));
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

                                shared.setSurveyContent($, placeholder, questionnaireRelatedDetailsTemplate({ resultSet: relatedResultSet, contentPreview: contentPreview, href: contentDocumentHref, feedbackUrl: feedbackUrl }));
                            };

                            $(document).on('click', '.related-read-more', (event) => {
                                getAssessment();
                                $('.progress-container, .blue-button-container, .details-button-container, .progress-results-button, .spider-button').css('display', 'none');
                                const resultSetId = $(event.target).data('warpjsResultSet');
                                const relatedResultSet = _.find(result.data._embedded.questionnaires[0]._embedded.resultSets, (resultSet) => {
                                    return resultSet.id === resultSetId;
                                });

                                readMoreSetup(resultSetId, relatedResultSet);
                            });

                            $(document).on('click', '.related-all-read-more', (event) => {
                                getAssessment();
                                $('.progress-container, .blue-button-container, .details-button-container, .progress-results-button, .spider-button').css('display', 'none');
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
                                $('.progress-container, .blue-button-container, .details-button-container').css('display', 'block');
                                $('.progress-results-button, .spider-button', placeholder).css('display', 'inline-block');
                                relatedReadingSetup();
                            });

                            $(document).on('click', '.progress-bar-container', (event) => {
                                track('progress-bar', `Progress bar: Category=${categoryPointer} - Question=${questionPointer}`);
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

                                    categoryPointer = _.findIndex(categories, (o) => {
                                        return o.id && o.id === progressFilteredCategories[selectedCategoryIndex].id;
                                    });
                                    iterationPointer = 0;
                                    questionPointer = 0;
                                    iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                        return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                    });
                                    questions = getQuestions(iterations);

                                    if (categories[categoryPointer].isRepeatable) {
                                        questionPointer = -1;
                                    }

                                    updateQuestionContent('');
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
                                track('submit', `Stay in touch: ${$('input#name').val() || '<no name>'} // ${$('input#email').val() || '<no email>'}`);
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

                            $(document).on('click', '.spider-button', (event) => {
                                track('overview', `Overview`);
                                if (result.data.assessmentId) {
                                    spiderSetup('progress');
                                }
                            });

                            $(document).on('click', '.module-details-button', (event) => {
                                event.preventDefault();
                                getAssessment();
                                const target = $(event.target);
                                const moduleId = target.data('warpjsModuleId');
                                const questionId = target.data('warpjsQuestionId');
                                const selectedCategory = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                    return category.id === moduleId;
                                });
                                shared.setSurveyContent($, placeholder, questionnaireModuleDetailsTemplate({ selectedCategory: selectedCategory, questionId: questionId }));
                            });

                            $(document).on('click', '.module-details-back', (event) => {
                                const target = $(event.target);
                                const moduleId = target.data('warpjsModuleId');
                                const questionId = target.data('warpjsQuestionId');
                                const selectedCategory = _.find(categories, { id: moduleId });
                                const currentQuestion = selectedCategory ? _.cloneDeep(_.find(selectedCategory._embedded.questions, { id: questionId })) : null;
                                const sections = _.groupBy(categoriesMinusIntro, (category) => {
                                    return category.section === undefined ? '' : category.section;
                                });
                                shared.setSurveyContent($, placeholder, questionnaireModulesTemplate({ sections: sections, question: currentQuestion }));
                                assignModulesSelected();
                                styleRadio($);
                            });

                            $(document).on('click', '.details-button', (event) => {
                                track('details', `Details: Category=${categoryPointer} - Question=${questionPointer}`);
                                categoryPointer = 0;
                                iterationPointer = 0;
                                progress = 0;
                                categories = getCategories(assessment.answers[0]._embedded.categories);
                                iterations = getIterations(categories);
                                questions = getQuestions(iterations);
                                questionPointer = _.findIndex(questions, (currentQuestion) => {
                                    const qQuestion = _.find(result.data._embedded.questionnaires[0]._embedded.categories[0]._embedded.questions, [ 'id', currentQuestion.id ]);

                                    return qQuestion && qQuestion.name === constants.specializedTemplates.description;
                                });

                                updateQuestionContent();
                            });
                        })
                    ;
                }
            }
        })
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
