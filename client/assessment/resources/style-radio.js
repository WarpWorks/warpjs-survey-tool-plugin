module.exports = ($) => {
    if (!$('a.radio-fx').length) {
        $("input:radio, input[type='checkbox']").hide().each(function() {
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
            $(":radio[data-radio-fx='" + unique + "'], input[type='checkbox'][data-radio-fx='" + unique + "']").attr('checked', false);
            if (!checked || !$('.questionnaire.question').length) {
                $(this).find('span').addClass('radio-checked');
                $(this).prev("input:radio, input[type='checkbox']").attr('checked', true);
            }
            if ($(":radio.question-options[data-radio-fx='" + unique + "'][checked='checked']").length) {
                $('.questionnaire.question .question-next').html('Next Question');
            } else if ($(this).hasClass('question-options')) {
                $('.questionnaire.question .question-next').html("Don't know (yet)");
            }
        });
    }
};
