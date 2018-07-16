const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const errorTemplate = require('./error.hbs');
const template = require('./template.hbs');

(($) => $(document).ready(() => {
    const loader = warpjsUtils.toast.loading($, "Page is loading");
    const placeholder = $('#warpjs-content-placeholder');

    return warpjsUtils.getCurrentPageHAL($)
        .then((result) => {
            warpjsUtils.toast.close($, loader);
            if (result.error) {
                placeholder.html(errorTemplate(result.data));
            } else {
                return Promise.resolve()
                    .then(() => placeholder.html(template({questionnaire: result.data})))
                    .then(() => warpjsUtils.documentReady($))
                    .then(() => {
                        $(document).on('click', '.quesitonnaire-link', (e) => {
                            e.preventDefault();
                            console.log('id of quesitonnaire: ', $(e.target).data('id'));
                        });
                    })
                ;
            }
        })
    ;
}))(jQuery);
