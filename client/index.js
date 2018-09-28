const Promise = require('bluebird');

const errorTemplate = require('./error.hbs');
const template = require('./template.hbs');
const questionnairesTemplate = require('./questionnaires.hbs');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.html(template());
    $('.progress-container').css('display', 'none');

    return window.WarpJS.getCurrentPageHAL($)
        .then((result) => {
            window.WarpJS.toast.close($, loader);
            if (result.error) {
                placeholder.html(errorTemplate(result.data));
            } else {
                return Promise.resolve()
                    .then(() => questionnairesTemplate({questionnaire: result.data}))
                    .then((content) => $('.ipt-body').html(content))
                    .then(() => {
                        $('[data-toggle="tooltip"]').tooltip({
                            container: 'body',
                            trigger: 'click'
                        });
                        $(document).on('click', '.questionnaire-link', (event) => {
                            event.preventDefault();
                            $.post($(event.target).data('url'), (data) => {
                                window.location.href = data._links.self.href;
                            });
                        });
                    })
                ;
            }
        })
    ;
}))(jQuery);
