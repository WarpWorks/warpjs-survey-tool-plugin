const _ = require('lodash');
const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../constants');
const errorTemplate = require('./../error.hbs');
const questionnaireTemplate = require('./questionnaire.hbs');
const questionnaireIntroTemplate = require('./questionnaire-intro.hbs');
const questionnaireDescriptionTemplate = require('./questionnaire-description.hbs');
const questionnaireLevelsTemplate = require('./questionnaire-levels.hbs');
const questionnaireIterationTemplate = require('./questionnaire-iterations.hbs');
const questionnaireSummaryTemplate = require('./questionnaire-summary.hbs');
const questionnaireDetailsTemplate = require('./questionnaire-details.hbs');
const template = require('./../template.hbs');

(($) => $(document).ready(() => {
    const loader = warpjsUtils.toast.loading($, "Page is loading");
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.html(template());

    function styleRadio() {
        $('input:radio').hide().each(function() {
            $(this).attr('data-radio-fx', this.name);
            var label = $("label[for=" + '"' + this.id + '"' + "]").text();
            $('<a ' + (label !== '' ? 'title=" ' + label + ' "' : '') + ' data-radio-fx="' + this.name + '" class="radio-fx" href="#">' +
                '<span class="radio' + (this.checked ? ' radio-checked' : '') + '"></span></a>').insertAfter(this);
        });

        if ($(":radio[checked='checked']").length) {
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
            if ($(":radio[data-radio-fx='" + unique + "'][checked='checked']").length) {
                $('.questionnaire.question .question-next').html('Next Question');
            } else {
                $('.questionnaire.question .question-next').html("Don't know (yet)");
            }
        });
    }

    return warpjsUtils.getCurrentPageHAL($)
        .then((result) => {
            // const introCategory = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
            //     return category.name === constants.specializedTemplates.introCategory;
            // });
            let categoryPointer = 0;
            let iterationPointer = 0;
            let questionPointer = 0;
            let progress = 0;
            let categories = _.filter(result.data._embedded.answers[0]._embedded.categories, (progressCategory) => {
                const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                    return progressQuestion.detailLevel <= result.data.detailLevel;
                });
                return questionDetailLevels.length > 0;
            });
            let iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
            });
            let questions = iterations.length > 0 ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                return question.detailLevel <= result.data.detailLevel;
            }) : [];

            let progressFilteredCategories = [];

            function updateProgressTotal() {
                // progressFilteredCategories = _.filter(categories, (progressCategory) => {
                //     return introCategory ? progressCategory.id !== introCategory.id : true;
                // });
                progressFilteredCategories = _.cloneDeep(categories);
                progressFilteredCategories.push('results');
            }

            updateProgressTotal();

            warpjsUtils.toast.close($, loader);
            if (result.error) {
                placeholder.html(errorTemplate(result.data));
            } else {
                return Promise.resolve()
                    .then(() => warpjsUtils.documentReady($))
                    .then(() => {
                        function assignDetailLevelSelected() {
                            const detailLevel = result.data.detailLevel !== '' ? result.data.detailLevel : 2;
                            $("input[name='questionnaire-level'][value='" + detailLevel + "']").attr('checked', 'checked');
                        }

                        $(document).on('click', '.description-back', () => {
                            result.data.projectName = $('#project-name').val();
                            result.data.mainContact = $('#main-contact').val();
                            result.data.projectStatus = $('#project-status').val();
                        });
                        $(document).on('click', '.description-next', () => {
                            result.data.projectName = $('#project-name').val();
                            result.data.mainContact = $('#main-contact').val();
                            result.data.projectStatus = $('#project-status').val();
                        });
                        $(document).on('click', '.levels-back', () => {
                            result.data.detailLevel = $("input[name='questionnaire-level'][checked='checked']").val();
                            categories = _.filter(result.data._embedded.answers[0]._embedded.categories, (progressCategory) => {
                                const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                                    return progressQuestion.detailLevel <= result.data.detailLevel;
                                });
                                return questionDetailLevels.length > 0;
                            });
                            updateProgressTotal();
                        });
                        $(document).on('click', '.levels-next', () => {
                            result.data.detailLevel = $("input[name='questionnaire-level'][checked='checked']").val();
                            categories = _.filter(result.data._embedded.answers[0]._embedded.categories, (progressCategory) => {
                                const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                                    return progressQuestion.detailLevel <= result.data.detailLevel;
                                });
                                return questionDetailLevels.length > 0;
                            });
                            updateProgressTotal();
                        });

                        function updatePointers(direction) {
                            categories = _.filter(categories, (progressCategory) => {
                                const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                                    return progressQuestion.detailLevel <= result.data.detailLevel;
                                });
                                return questionDetailLevels.length > 0;
                            });
                            iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                            });
                            questions = iterations.length ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                return question.detailLevel <= result.data.detailLevel;
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
                                                return question.detailLevel <= result.data.detailLevel;
                                            }) : [];
                                            if (categories[categoryPointer].isRepeatable) {
                                                questionPointer = -1;
                                            }
                                        }
                                    } else {
                                        iterationPointer += 1;
                                        questionPointer = 0;

                                        questions = _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                            return question.detailLevel <= result.data.detailLevel;
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
                                                return question.detailLevel <= result.data.detailLevel;
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
                        }

                        function assignOptionSelected(qQuestion, aQuestion) {
                            if (typeof qQuestion !== 'undefined' && typeof aQuestion !== 'undefined') {
                                let option = _.find(qQuestion._embedded.options, (option) => {
                                    return option.id === aQuestion.answer;
                                });
                                if (typeof option !== 'undefined') {
                                    option.isSelected = true;
                                }
                            }
                            return qQuestion;
                        }

                        function templateValues() {
                            const currentCategory = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                return category.id === categories[categoryPointer].id;
                            });
                            const currentQuestion = questions[questionPointer] ? _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                return question.id === questions[questionPointer].id;
                            })) : null;
                            const updatedQuestion = assignOptionSelected(currentQuestion, questions[questionPointer]);
                            let values = {category: currentCategory, question: updatedQuestion};
                            if (iterations[iterationPointer] && iterations[iterationPointer].name !== '') {
                                values.iteration = iterations[iterationPointer];
                            }

                            if (currentQuestion && currentQuestion.imageUrl) {
                                values.image = currentQuestion.imageUrl;
                            } else if (currentCategory.imageUrl) {
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

                            const currentImglib = currentImageLibrary ? _.find(result.data._embedded.questionnaires[0]._embedded.imageLibraries, (imageLibrary) => {
                                return imageLibrary.id === currentImageLibrary;
                            }) : null;

                            const currentImageArea = imageArea ? _.find(currentImglib && currentImglib._embedded.images ? currentImglib._embedded.images[0]._embedded.imageMaps : null, (imageMap) => {
                                return imageMap && imageMap.title === imageArea;
                            }) : null;
                            const currentImageHeight = currentImglib && currentImglib._embedded.images ? currentImglib._embedded.images[0].height : null;
                            const currentImageWidth = currentImglib && currentImglib._embedded.images ? currentImglib._embedded.images[0].width : null;
                            values.imageMap = currentImageArea ? currentImageArea.coords : null;
                            values.imageHeight = currentImageHeight;
                            values.imageWidth = currentImageWidth;

                            return values;
                        }

                        function introTemplateValues() {
                            const currentCategory = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                return category.id === categories[categoryPointer].id;
                            });
                            const currentQuestion = _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                return question.id === questions[questionPointer].id;
                            }));
                            let values = {category: currentCategory, question: currentQuestion};
                            if (questionPointer) {
                                values.notFirst = true;
                            }

                            if (currentQuestion.imageUrl) {
                                values.image = currentQuestion.imageUrl;
                            }

                            return values;
                        }

                        function createImageMapElements(imageMapValues) {
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
                        }

                        function summaryValues() {
                            return _.filter(_.map(result.data._embedded.answers[0]._embedded.categories, (category) => {
                                const categoryQ = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (questionCategory) => {
                                    return questionCategory.id === category.id;
                                });
                                const answersList = _.compact(_.flatten(_.map(category._embedded.iterations, (iteration) => {
                                    return _.map(iteration._embedded.questions, (question) => {
                                        let position = null;
                                        if (question.detailLevel <= result.data.detailLevel) {
                                            const categoryQ = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (questionCategory) => {
                                                return questionCategory.id === category.id;
                                            });
                                            const questionQ = _.find(categoryQ._embedded.questions, (questionQuestion) => {
                                                return questionQuestion.id === question.id;
                                            });
                                            const option = _.find(questionQ._embedded.options, (option) => {
                                                return option.id === question.answer;
                                            });
                                            position = option ? option.position : null;
                                        }

                                        return parseInt(position);
                                    });
                                })));

                                return {
                                    category: categoryQ.name,
                                    answerAverage: answersList ? Math.round(_.mean(answersList) * 10) / 10 : null
                                };
                            }), (category) => {
                                return category.answerAverage;
                            });
                        }

                        function summarySetup() {
                            $('.ipt-body').html(questionnaireSummaryTemplate({values: summaryValues()}));
                            $('.summary .marker').each((index, element) => {
                                const score = $(element).data('score');
                                const offset = (score - 1) / 4 * 100 + 12.5;
                                const colorScore = Math.round(score);
                                let color = '#de2a2d';
                                if (colorScore <= 2) {
                                    color = '#7eba41';
                                } else if (colorScore === 3) {
                                    color = '#fcb830';
                                }
                                $(element).css('left', 'calc(' + offset + '% - 5px)').css('background-color', color);
                            });
                            $('.summary .average-number').each((index, element) => {
                                const score = $(element).data('score');
                                const offset = (score - 1) / 4 * 100 + 12.5;
                                $(element).css('margin-left', 'calc(' + offset + '% - 15px)');
                            });
                        }

                        function detailsValues() {
                            return _.filter(_.map(result.data._embedded.answers[0]._embedded.categories, (category) => {
                                const categoryQ = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (questionCategory) => {
                                    return questionCategory.id === category.id;
                                });
                                const answersList = _.map(category._embedded.iterations, (iteration) => {
                                    const iterationQ = _.map(iteration._embedded.questions, (question) => {
                                        if (question.detailLevel <= result.data.detailLevel) {
                                            const questionQ = _.find(categoryQ._embedded.questions, (questionQuestion) => {
                                                return questionQuestion.id === question.id;
                                            });
                                            const option = _.find(questionQ._embedded.options, (option) => {
                                                return option.id === question.answer;
                                            });

                                            return {
                                                name: questionQ.name,
                                                hasOptions: !!questionQ._embedded.options.length,
                                                position: questionQ._embedded.options.length && option ? option.position : null,
                                                option: questionQ._embedded.options.length && option ? option.name : null
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
                                        iterations: filteredAnswersList
                                    };
                                } else {
                                    return null;
                                }
                            }), (category) => {
                                return category !== null && category.category !== constants.specializedTemplates.introCategory;
                            });
                        }

                        function updateQuestionContent(outOfBounds = '') {
                            const progressPosition = _.findIndex(progressFilteredCategories, function(o) {
                                return o.id && o.id === categories[categoryPointer].id;
                            });
                            progress = (progressPosition + 1) / progressFilteredCategories.length * 100;
                            const currentCategory = _.find(result.data._embedded.questionnaires[0]._embedded.categories, (category) => {
                                return category.id === categories[categoryPointer].id;
                            });

                            if (outOfBounds !== '') {
                                if (outOfBounds === 'front') {

                                } else if (outOfBounds === 'end') {
                                    progress = 100;
                                    summarySetup();
                                }
                            } else if (questionPointer === -1) {
                                const values = templateValues();
                                $('.ipt-body').html(questionnaireIterationTemplate({category: currentCategory, iterations: categories[categoryPointer]._embedded.iterations, image: values.image}));
                                if (values.imageMap) {
                                    createImageMapElements(values.imageMap);
                                }
                            } else {
                                if (currentCategory.name === constants.specializedTemplates.introCategory) {
                                    const currentQuestion = _.cloneDeep(_.find(currentCategory._embedded.questions, (question) => {
                                        return question.id === questions[questionPointer].id;
                                    }));
                                    if (currentQuestion.name === constants.specializedTemplates.description) {
                                        $('.ipt-body').html(questionnaireDescriptionTemplate({projectName: result.data.projectName, projectStatus: result.data.projectStatus, mainContact: result.data.mainContact, question: currentQuestion}));
                                    } else if (currentQuestion.name === constants.specializedTemplates.details) {
                                        $('.ipt-body').html(questionnaireLevelsTemplate({level: result.data.detailLevel, question: currentQuestion}));
                                        assignDetailLevelSelected();
                                    } else {
                                        $('.ipt-body').html(questionnaireIntroTemplate(introTemplateValues()));
                                    }
                                } else {
                                    const values = templateValues();
                                    $('.ipt-body').html(questionnaireTemplate(values));
                                    if (values.imageMap) {
                                        createImageMapElements(values.imageMap);
                                    }

                                    $('.image-map-img-container > img').css({width: values.imageWidth ? values.imageWidth : 'auto', height: values.imageHeight ? values.imageHeight : 'auto'});
                                }
                            }

                            $('.ipt .progress-bar').css('width', progress + '%');
                            styleRadio();
                        }

                        function updateIterations() {
                            const category = result.data._embedded.answers[0]._embedded.categories[categoryPointer];
                            category._embedded.iterations[0].name = $('input#iteration1').val();
                            category._embedded.iterations[1].name = $('input#iteration2').val();
                            category._embedded.iterations[2].name = $('input#iteration3').val();
                            category._embedded.iterations[3].name = $('input#iteration4').val();
                            category._embedded.iterations[4].name = $('input#iteration5').val();
                            category._embedded.iterations[5].name = $('input#iteration6').val();
                        }

                        function updateQuestions() {
                            if (questions && questions[questionPointer]) {
                                questions[questionPointer].answer = $("input[name='question-options'][checked='checked']").val();
                            }
                        }

                        if (result.data._embedded.answers[0]._embedded.categories[categoryPointer].isRepeatable === true) {
                            questionPointer = -1;
                        }

                        categories = result.data._embedded.answers[0]._embedded.categories;
                        iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                            return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                        });
                        questions = iterations.length > 0 ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                            return question.detailLevel <= result.data.detailLevel;
                        }) : [];

                        updateQuestionContent();

                        $(document).on('click', '.question-next', () => {
                            updateQuestions();
                            updatePointers('next');
                        });
                        $(document).on('click', '.question-back', () => {
                            updateQuestions();
                            updatePointers('back');
                        });
                        $(document).on('click', '.iteration-next', () => {
                            updateIterations();
                            updatePointers('next');
                        });
                        $(document).on('click', '.iteration-back', () => {
                            updateIterations();
                            updatePointers('back');
                        });
                        $(document).on('click', '.summary-back', () => {
                            updateQuestionContent();
                        });
                        $(document).on('click', '.summary-next', () => {
                            const details = {
                                questionnaire: result.data._embedded.questionnaires[0].name,
                                name: result.data.projectName,
                                contact: result.data.mainContact,
                                status: result.data.projectStatus,
                                data: detailsValues()
                            };
                            $('.ipt-body').html(questionnaireDetailsTemplate({details: details}));
                        });
                        $(document).on('click', '.details-back', () => {
                            summarySetup();
                        });
                        $(document).on('click', '.progress-bar-container', (event) => {
                            const progressBar = $('.progress-bar-container');
                            const progressWidth = progressBar.innerWidth();
                            const offset_l = progressBar.offset().left - $(window).scrollLeft();
                            const left = Math.round((event.clientX - offset_l));
                            const progressPercent = Math.round((left / progressWidth) * 100);
                            const selectedCategoryIndex = (Math.ceil((progressPercent / 100) * progressFilteredCategories.length) - 1);

                            if ($('.questionnaire.question').length) {
                                updateQuestions();
                            } else if ($('.questionnaire.description').length) {
                                result.data.projectName = $('#project-name').val();
                                result.data.mainContact = $('#main-contact').val();
                                result.data.projectStatus = $('#project-status').val();
                            } else if ($('.questionnaire.levels').length) {
                                result.data.detailLevel = $("input[name='questionnaire-level'][checked='checked']").val();
                                categories = _.filter(result.data._embedded.answers[0]._embedded.categories, (progressCategory) => {
                                    const questionDetailLevels = _.filter(progressCategory._embedded.iterations[0]._embedded.questions, (progressQuestion) => {
                                        return progressQuestion.detailLevel <= result.data.detailLevel;
                                    });
                                    return questionDetailLevels.length > 0;
                                });
                                updateProgressTotal();
                            } else if ($('.questionnaire.iterations').length) {
                                updateIterations();
                            }

                            if (progressFilteredCategories[selectedCategoryIndex] === 'results') {
                                categoryPointer = categories.length - 1;
                                iterations = _.filter(categories[categoryPointer]._embedded.iterations, function(iteration) {
                                    return categories[categoryPointer].isRepeatable ? iteration.name !== '' : true;
                                });
                                iterationPointer = iterations.length - 1;
                                questions = iterations.length ? _.filter(iterations[iterationPointer]._embedded.questions, function(question) {
                                    return question.detailLevel <= result.data.detailLevel;
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
                                    return question.detailLevel <= result.data.detailLevel;
                                }) : [];

                                if (categories[categoryPointer].isRepeatable) {
                                    questionPointer = -1;
                                }

                                updateQuestionContent('');
                            }
                        });
                    })
                ;
            }
        })
    ;
}))(jQuery);
