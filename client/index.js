const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const errorTemplate = require('./error.hbs');
const template = require('./template.hbs');
const questionnairesTemplate = require('./questionnaires.hbs');

(($) => $(document).ready(() => {
    const loader = warpjsUtils.toast.loading($, "Page is loading");
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.html(template());

    return warpjsUtils.getCurrentPageHAL($)
        .then((result) => {
            warpjsUtils.toast.close($, loader);
            if (result.error) {
                placeholder.html(errorTemplate(result.data));
            } else {
                return Promise.resolve()
                    .then(() => questionnairesTemplate({questionnaire: result.data}))
                    .then((content) => $('.ipt-body').html(content))
                    .then(() => warpjsUtils.documentReady($))
                    .then(() => {
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
