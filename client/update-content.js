const Promise = require('bluebird');
const errorTemplate = require('./error.hbs');
const questionnaireTemplate = require('./questionnaire.hbs');

module.exports = ($, cache, result) => Promise.resolve()
    .then(() => {
        // Add the CSS if not already loaded.
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = result.link;
        document.head.appendChild(link);
        $('.modal-body').html($(questionnaireTemplate({questionnaire: result})));

        $('input:radio').hide().each(function() {
            $(this).attr('data-radio-fx', this.name);
            var label = $("label[for=" + '"' + this.id + '"' + "]").text();
            $('<a ' + (label !== '' ? 'title=" ' + label + ' "' : '') + ' data-radio-fx="' + this.name + '" class="radio-fx" href="#">' +
                '<span class="radio' + (this.checked ? ' radio-checked' : '') + '"></span></a>').insertAfter(this);
        });
        $('a.radio-fx').on('click', function(e) {
            e.preventDefault();
            var unique = $(this).attr('data-radio-fx');
            $("a[data-radio-fx='" + unique + "'] span").removeClass('radio-checked');
            $(":radio[data-radio-fx='" + unique + "']").attr('checked', false);
            $(this).find('span').addClass('radio-checked');
            $(this).prev('input:radio').attr('checked', true);
        });

        return result;
    })
    .then(() => {
        const total_questions = $('[data-warpjs-modal="ipt"] .category .question').length;
        let total_question_position = 0;
        let progress = total_question_position / total_questions * 100;
        let category_num = 0;
        let question_num = 0;
        let category_count = result._embedded.categories.length;
        let questions_in_cat = result._embedded.categories[category_num]._embedded.questions.length;
        const changeViewForward = (event) => {
            total_question_position += 1;
            progress = total_question_position / total_questions * 100;
            $('[data-warpjs-modal="ipt"] .progress-bar').css('width', progress + '%');

            console.log('total questions:', total_questions, total_question_position / total_questions * 100);
            $('[data-warpjs-modal="ipt"] .category-' + category_num + ' .question-' + question_num).removeClass('show-item');
            if (question_num + 1 < questions_in_cat) {
                question_num += 1;
                $('[data-warpjs-modal="ipt"] .category-' + category_num + ' .question-' + question_num).addClass('show-item');
            } else if (category_num + 1 < category_count) {
                $('[data-warpjs-modal="ipt"] .category-' + category_num).removeClass('show-item');
                $('[data-warpjs-modal="ipt"] .category-' + category_num + ' .question-' + question_num).removeClass('show-item');
                category_num += 1;
                question_num = 0;
                questions_in_cat = result._embedded.categories[category_num]._embedded.questions.length;
                $('[data-warpjs-modal="ipt"] .category-' + category_num).addClass('show-item');
                $('[data-warpjs-modal="ipt"] .category-' + category_num + ' .question-' + question_num).addClass('show-item');
            }

            // if ($(event.target).parent().next().length) {
            //     $(event.target).parent().toggleClass('show-item');
            //     $(event.target).parent().next().toggleClass('show-item');
            // } else if ($(event.target).closest('.category').next().length) {
            //     $(event.target).closest('.category').toggleClass('show-item');
            //     $(event.target).closest('.category').next().toggleClass('show-item');
            // } else {
            //     $(event.target).closest('.category').toggleClass('show-item');
            //     $('.end').toggleClass('show-item');
            // }
        };

        const changeViewBack = (event) => {
            total_question_position -= 1;
            progress = total_question_position / total_questions * 100;
            $('[data-warpjs-modal="ipt"] .progress-bar').css('width', progress + '%');
            $('[data-warpjs-modal="ipt"] .category-' + category_num + ' .question-' + question_num).removeClass('show-item');
            if (question_num - 1 >= 0) {
                question_num -= 1;
                $('[data-warpjs-modal="ipt"] .category-' + category_num + ' .question-' + question_num).addClass('show-item');
            } else if (category_num - 1 >= 0) {
                $('[data-warpjs-modal="ipt"] .category-' + category_num).removeClass('show-item');
                $('[data-warpjs-modal="ipt"] .category-' + category_num + ' .question-' + question_num).removeClass('show-item');
                category_num -= 1;
                questions_in_cat = result._embedded.categories[category_num]._embedded.questions.length;
                question_num = questions_in_cat - 1;
                $('[data-warpjs-modal="ipt"] .category-' + category_num).addClass('show-item');
                $('[data-warpjs-modal="ipt"] .category-' + category_num + ' .question-' + question_num).addClass('show-item');
            }

            // console.log('has previous: ', $(event.target).parent().prev().length, $(event.target).parent().is(':first-child'));
            // if (!$(event.target).parent().is(':first-child')) {
            //     $(event.target).parent().toggleClass('show-item');
            //     $(event.target).parent().prev().toggleClass('show-item');
            // } else if (!$(event.target).closest('.category').is(':first-child')) {
            //     $(event.target).closest('.category').toggleClass('show-item');
            //     $(event.target).closest('.category').prev().toggleClass('show-item');
            // } else {
            //     $(event.target).closest('.category').toggleClass('show-item');
            //     $('.end').toggleClass('show-item');
            // }
        };
        // $('input:radio').change((event) => changeQuestion(event));
        $('[data-warpjs-modal="ipt"] .next').click((event) => changeViewForward(event));
        $('[data-warpjs-modal="ipt"] .back').click((event) => changeViewBack(event));
    })

// Check if SVG is supported
// .then(() => {
//     if (!(window && window.SVG && window.SVG.supported)) {
//         throw new Error("Cannot open ImageEditor: This browser does not support SVG!");
//     }
// })

// Update modal-body
// .then(() => bodyTemplate({images: result._embedded.images}))
// .then(($, cache, result) => {
//     $('.modal-body').html($(questionnaireTemplate({questionnaire: result})));
// })

// .then((questionnaire) => $('.modal-body', cache.MODAL_SELECTOR).html(questionnaire))

// Add image
// .then(() => addImage($, cache, result._embedded.images[0]))

    .catch((err) => $('.modal-body', cache.MODAL_SELECTOR).html(errorTemplate(err)))
;
