const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const errorTemplate = require('./error.hbs');
const template = require('./template.hbs');
const quesitonnairesTemplate = require('./questionnaires.hbs');

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
                    .then(() => quesitonnairesTemplate({questionnaire: result.data}))
                    .then((content) => $('.ipt-body').html(content))
                    .then(() => warpjsUtils.documentReady($))
                    .then(() => {
                        $(document).on('click', '.quesitonnaire-link', (e) => {
                            e.preventDefault();
                            console.log('url of quesitonnaire: ', $(e.target).data('url'));
                            $.post($(e.target).data('url'), function(data) {
                                console.log('Data Loaded: ' + data);
                            });
                        });
                    })
                ;
            }
        })
    ;
}))(jQuery);
